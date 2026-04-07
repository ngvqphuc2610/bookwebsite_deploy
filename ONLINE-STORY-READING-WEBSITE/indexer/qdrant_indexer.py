"""
qdrant_indexer.py — Metadata-only indexer for manga/stories
Reads from MySQL (nhom8_db), embeds via Ollama, upserts to Qdrant.

Usage:
  pip install -r requirements.txt
  cp .env.example .env   # edit credentials
  python qdrant_indexer.py [--limit N] [--story-id ID]
"""

import os
import sys
import json
import time
import argparse
import logging
from typing import List, Dict, Optional

import requests
import mysql.connector
from dotenv import load_dotenv
from qdrant_client import QdrantClient
from qdrant_client.models import (
    VectorParams, Distance, PointStruct, CollectionInfo
)

load_dotenv()

# ──────────── Config ────────────
QDRANT_URL        = os.getenv("QDRANT_URL", "http://localhost:6335")
QDRANT_COLLECTION = os.getenv("QDRANT_COLLECTION", "manga")
OLLAMA_URL        = os.getenv("OLLAMA_URL", "http://localhost:11434")
EMBED_MODEL       = os.getenv("EMBED_MODEL", "nomic-embed-text")
EMBED_DIM         = int(os.getenv("EMBED_DIM", "768"))
BATCH_SIZE        = int(os.getenv("BATCH_SIZE", "100"))

MYSQL_HOST     = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT     = int(os.getenv("MYSQL_PORT", "3307"))
MYSQL_USER     = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB       = os.getenv("MYSQL_DB", "nhom8_db2")

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


# ──────────── Ollama embedding ────────────
def _embed_via_new_api(texts: List[str]) -> List[List[float]]:
    """Ollama new API: POST /api/embed with batched input."""
    url = f"{OLLAMA_URL}/api/embed"
    resp = requests.post(url, json={"model": EMBED_MODEL, "input": texts}, timeout=120)
    resp.raise_for_status()
    data = resp.json()
    embeddings = data.get("embeddings", [])
    if len(embeddings) != len(texts):
        raise ValueError(f"Expected {len(texts)} embeddings, got {len(embeddings)}")
    return embeddings


def _embed_via_legacy_api(texts: List[str]) -> List[List[float]]:
    """Ollama legacy API: POST /api/embeddings with one prompt per request."""
    url = f"{OLLAMA_URL}/api/embeddings"
    embeddings: List[List[float]] = []
    for text in texts:
        resp = requests.post(url, json={"model": EMBED_MODEL, "prompt": text}, timeout=120)
        resp.raise_for_status()
        data = resp.json()
        vector = data.get("embedding")
        if not vector:
            raise ValueError("Legacy /api/embeddings returned no 'embedding'")
        embeddings.append(vector)
    return embeddings


def embed_texts(texts: List[str], retries: int = 3) -> List[List[float]]:
    """Get embeddings for a list of texts; supports both new and legacy Ollama APIs."""

    for attempt in range(1, retries + 1):
        try:
            try:
                return _embed_via_new_api(texts)
            except requests.HTTPError as http_err:
                status_code = http_err.response.status_code if http_err.response is not None else None
                if status_code == 404:
                    logger.info("/api/embed not found, fallback to legacy /api/embeddings")
                    return _embed_via_legacy_api(texts)
                raise
        except Exception as e:
            logger.warning(f"Embed attempt {attempt}/{retries} failed: {e}")
            if attempt < retries:
                time.sleep(2 ** attempt)
            else:
                raise


# ──────────── MySQL helpers ────────────
def get_db_connection():
    return mysql.connector.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        charset="utf8mb4",
    )


def fetch_stories(limit: Optional[int] = None, story_id: Optional[int] = None) -> List[Dict]:
    """Fetch stories with their genres from MySQL."""
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    query = """
        SELECT s.id, s.slug, s.title, s.author, s.description,
               s.status, s.is_premium, s.view_count, s.cover_image,
               s.created_at, s.updated_at,
               GROUP_CONCAT(g.name SEPARATOR ', ') AS genres
        FROM stories s
        LEFT JOIN story_genres sg ON s.id = sg.story_id
        LEFT JOIN genres g ON sg.genre_id = g.id
    """
    params = []
    if story_id:
        query += " WHERE s.id = %s"
        params.append(story_id)

    query += " GROUP BY s.id ORDER BY s.id"

    if limit:
        query += " LIMIT %s"
        params.append(limit)

    cursor.execute(query, params)
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    return rows


def compose_text(story: Dict) -> str:
    """Build the text string to embed for one story."""
    parts = []
    parts.append(f"Title: {story.get('title', '')}")
    if story.get("author"):
        parts.append(f"Author: {story['author']}")
    if story.get("genres"):
        parts.append(f"Genres: {story['genres']}")
    if story.get("status"):
        parts.append(f"Status: {story['status']}")
    if story.get("description"):
        desc = story["description"]
        # Strip HTML tags if any
        import re
        desc = re.sub(r"<[^>]+>", "", desc)
        # Truncate very long descriptions to ~500 chars
        if len(desc) > 500:
            desc = desc[:500] + "..."
        parts.append(f"Description: {desc}")
    return "\n".join(parts)


# ──────────── Qdrant helpers ────────────
def ensure_collection(client: QdrantClient):
    """Create collection if it doesn't exist."""
    collections = [c.name for c in client.get_collections().collections]
    if QDRANT_COLLECTION not in collections:
        client.create_collection(
            collection_name=QDRANT_COLLECTION,
            vectors_config=VectorParams(size=EMBED_DIM, distance=Distance.COSINE),
        )
        logger.info(f"Created collection '{QDRANT_COLLECTION}' (dim={EMBED_DIM})")
    else:
        logger.info(f"Collection '{QDRANT_COLLECTION}' already exists")


def build_payload(story: Dict) -> Dict:
    """Build Qdrant point payload from a story row."""
    genres_list = [g.strip() for g in (story.get("genres") or "").split(",") if g.strip()]
    return {
        "story_id": story["id"],
        "slug": story.get("slug") or "",
        "title": story.get("title") or "",
        "author": story.get("author") or "",
        "genres": genres_list,
        "status": story.get("status") or "",
        "is_premium": bool(story.get("is_premium")),
        "view_count": story.get("view_count") or 0,
        "cover_image": story.get("cover_image") or "",
        "updated_at": str(story.get("updated_at") or ""),
    }


# ──────────── Main index logic ────────────
def index_stories(stories: List[Dict], client: QdrantClient):
    """Embed and upsert stories in batches."""
    total = len(stories)
    logger.info(f"Indexing {total} stories in batches of {BATCH_SIZE}")

    for i in range(0, total, BATCH_SIZE):
        batch = stories[i : i + BATCH_SIZE]
        texts = [compose_text(s) for s in batch]

        # Embed
        logger.info(f"  Embedding batch {i // BATCH_SIZE + 1} ({len(batch)} items)...")
        vectors = embed_texts(texts)

        # Verify dim
        if vectors and len(vectors[0]) != EMBED_DIM:
            raise RuntimeError(
                f"Embedding dim mismatch: expected {EMBED_DIM}, got {len(vectors[0])}. "
                f"Check EMBED_MODEL or EMBED_DIM env var."
            )

        # Build points
        points = []
        for story, vector in zip(batch, vectors):
            points.append(
                PointStruct(
                    id=story["id"],           # use story.id as point id (numeric)
                    vector=vector,
                    payload=build_payload(story),
                )
            )

        # Upsert
        client.upsert(collection_name=QDRANT_COLLECTION, points=points, wait=True)
        logger.info(f"  Upserted {len(points)} points (ids {batch[0]['id']}..{batch[-1]['id']})")

    logger.info(f"Done — {total} stories indexed into '{QDRANT_COLLECTION}'")


# ──────────── Delete helper ────────────
def delete_story_point(client: QdrantClient, story_id: int):
    """Delete a single point by story_id."""
    client.delete(
        collection_name=QDRANT_COLLECTION,
        points_selector=[story_id],
        wait=True,
    )
    logger.info(f"Deleted point for story_id={story_id}")


# ──────────── CLI ────────────
def main():
    parser = argparse.ArgumentParser(description="Index manga metadata into Qdrant")
    parser.add_argument("--limit", type=int, default=None, help="Max stories to index")
    parser.add_argument("--story-id", type=int, default=None, help="Index a single story by id")
    parser.add_argument("--delete", type=int, default=None, help="Delete a story point by id")
    args = parser.parse_args()

    client = QdrantClient(url=QDRANT_URL)
    ensure_collection(client)

    if args.delete is not None:
        delete_story_point(client, args.delete)
        return

    stories = fetch_stories(limit=args.limit, story_id=args.story_id)
    if not stories:
        logger.warning("No stories found to index")
        return

    index_stories(stories, client)


if __name__ == "__main__":
    main()

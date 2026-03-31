package com.example.Nhom8.config;

import com.example.Nhom8.service.HybridSearchService;
import com.example.Nhom8.service.QdrantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Ensures the search engine (Qdrant & MySQL) is correctly initialized and synced on startup.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SearchEngineInitializer implements CommandLineRunner {

    private final HybridSearchService hybridSearchService;
    private final QdrantService qdrantService;

    @Value("${qdrant.collection:manga}")
    private String mangaCollection;

    @Value("${qdrant.embed-dim:768}")
    private int embedDim;

    @Override
    public void run(String... args) {
        log.info("Starting Search Engine Initialization...");
        
        try {
            // 1. Ensure Qdrant collection exists
            qdrantService.ensureCollection(mangaCollection, embedDim);
            
            // 2. Trigger a full reindex to ensure vectors are up-to-date with 
            // the new logic (Title, Author, Genre focus).
            log.info("Triggering automatic reindex of stories for collection '{}'...", mangaCollection);
            int count = hybridSearchService.reindexAll();
            log.info("Search Engine Initialization complete. Reindexed {} stories.", count);
            
        } catch (Exception e) {
            log.error("Failed to initialize Search Engine. Search functionality may be limited. Error: ", e);
        }
    }
}

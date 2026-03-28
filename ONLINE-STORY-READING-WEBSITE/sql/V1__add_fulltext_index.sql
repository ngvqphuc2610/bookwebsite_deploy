-- Migration: add FULLTEXT index for hybrid keyword search
-- Run once on nhom8_db

ALTER TABLE stories ADD FULLTEXT idx_ft_stories (title, description, author);

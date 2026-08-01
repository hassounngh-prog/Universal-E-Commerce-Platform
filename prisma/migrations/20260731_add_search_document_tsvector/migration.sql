-- Rename "SearchDocument" to "search_documents" to match the SearchDocument model's
-- @@map annotation and the table name used by PostgresSearchProvider's raw SQL.
ALTER TABLE "SearchDocument" RENAME TO "search_documents";
ALTER INDEX "SearchDocument_index_idx" RENAME TO "search_documents_index_idx";

-- Generated tsvector column, previously created at runtime by
-- PostgresSearchProvider.createIndex (runtime schema mutation removed).
ALTER TABLE "search_documents"
  ADD COLUMN "searchable" tsvector
  GENERATED ALWAYS AS (to_tsvector('english'::regconfig, fields::text)) STORED;

-- CreateIndex
CREATE INDEX "search_documents_searchable_idx"
  ON "search_documents" USING GIN ("searchable");

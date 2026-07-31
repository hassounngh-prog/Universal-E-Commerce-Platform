export interface SearchDocument {
  id: string;
  index: string;
  fields: Record<string, unknown>;
}

export interface SearchQuery {
  index: string;
  text?: string;
  filters?: Record<string, unknown>;
  sort?: string;
  from?: number;
  size?: number;
}

export interface SearchHit {
  id: string;
  score: number;
  fields: Record<string, unknown>;
}

export interface SearchResult {
  hits: SearchHit[];
  total: number;
  tookMs: number;
}

export interface SearchProvider {
  readonly id: string;
  readonly name: string;

  indexDocument(document: SearchDocument): Promise<void>;
  bulkIndexDocuments(documents: SearchDocument[]): Promise<void>;
  deleteDocument(index: string, id: string): Promise<void>;
  search(query: SearchQuery): Promise<SearchResult>;
  createIndex(index: string, mapping?: Record<string, unknown>): Promise<void>;
  deleteIndex(index: string): Promise<void>;
}

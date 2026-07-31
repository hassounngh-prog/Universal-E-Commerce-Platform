import type {
  Collection,
  CollectionListFilter,
  CollectionListResult,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "./types";

export interface CollectionRepository {
  findById(tenantId: string | null, id: string): Promise<Collection | null>;
  findBySlug(tenantId: string | null, slug: string): Promise<Collection | null>;
  list(tenantId: string | null, filter?: CollectionListFilter): Promise<CollectionListResult>;
  create(tenantId: string | null, input: CreateCollectionInput): Promise<Collection>;
  update(tenantId: string | null, id: string, input: UpdateCollectionInput): Promise<Collection>;
  delete(tenantId: string | null, id: string): Promise<void>;
  addProduct(tenantId: string | null, id: string, productId: string): Promise<void>;
  removeProduct(tenantId: string | null, id: string, productId: string): Promise<void>;
}

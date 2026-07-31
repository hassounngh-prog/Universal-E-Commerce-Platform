import type {
  CreateProductInput,
  Product,
  ProductListFilter,
  ProductListResult,
  UpdateProductInput,
} from "./types";

export interface ProductRepository {
  findById(tenantId: string | null, id: string): Promise<Product | null>;
  findBySlug(tenantId: string | null, slug: string): Promise<Product | null>;
  list(filter: ProductListFilter): Promise<ProductListResult>;
  create(tenantId: string | null, input: CreateProductInput): Promise<Product>;
  update(tenantId: string | null, id: string, input: UpdateProductInput): Promise<Product>;
  delete(tenantId: string | null, id: string): Promise<void>;
  adjustStock(tenantId: string | null, id: string, delta: number): Promise<void>;
}

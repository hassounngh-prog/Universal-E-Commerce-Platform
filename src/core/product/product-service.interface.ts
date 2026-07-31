import type {
  CreateProductInput,
  Product,
  ProductAttributeValueInput,
  ProductListFilter,
  ProductListResult,
  UpdateProductInput,
} from "./types";

export interface ProductService {
  getById(tenantId: string | null, id: string): Promise<Product>;
  getBySlug(tenantId: string | null, slug: string): Promise<Product>;
  list(tenantId: string | null, filter: ProductListFilter): Promise<ProductListResult>;
  create(tenantId: string | null, input: CreateProductInput): Promise<Product>;
  update(tenantId: string | null, id: string, input: UpdateProductInput): Promise<Product>;
  delete(tenantId: string | null, id: string): Promise<void>;
  adjustStock(tenantId: string | null, id: string, delta: number): Promise<void>;
  setAttributeValues(
    tenantId: string | null,
    id: string,
    values: ProductAttributeValueInput[],
  ): Promise<Product>;
}

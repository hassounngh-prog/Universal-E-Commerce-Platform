export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  order: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string | null;
  barcode: string | null;
  price: number | null;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number | null;
  options: Record<string, unknown> | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductAttributeValue {
  id: string;
  productId: string;
  attributeId: string;
  value: unknown;
}

export interface Product {
  id: string;
  tenantId: string | null;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number | null;
  stock: number;
  sku: string;
  brandId: string | null;
  typeId: string | null;
  taxCategoryId: string | null;
  weightKg: number | null;
  dimensions: Record<string, unknown> | null;
  requiresShipping: boolean;
  categoryId: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  tags: string[];
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  images: ProductImage[];
  variants: ProductVariant[];
  attributeValues: ProductAttributeValue[];
}

export interface CreateProductInput {
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock?: number;
  sku: string;
  brandId?: string | null;
  typeId?: string | null;
  taxCategoryId?: string | null;
  weightKg?: number | null;
  dimensions?: Record<string, unknown> | null;
  requiresShipping?: boolean;
  categoryId?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  stock?: number;
  sku?: string;
  brandId?: string | null;
  typeId?: string | null;
  taxCategoryId?: string | null;
  weightKg?: number | null;
  dimensions?: Record<string, unknown> | null;
  requiresShipping?: boolean;
  categoryId?: string | null;
  isPublished?: boolean;
  isFeatured?: boolean;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
}

export interface ProductListFilter {
  tenantId?: string | null;
  categoryId?: string;
  brandId?: string;
  typeId?: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

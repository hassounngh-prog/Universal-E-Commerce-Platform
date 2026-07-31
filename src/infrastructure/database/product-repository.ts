import { Prisma, prisma } from "@/shared/lib/prisma";
import { ConflictError, NotFoundError } from "@/shared/errors/platform-error";
import { toJson, toJsonValue, toRecord } from "@/shared/lib/json";
import type { ProductRepository } from "@/core/product/product-repository.interface";
import type {
  CreateProductInput,
  Product,
  ProductAttributeValueInput,
  ProductListFilter,
  ProductListResult,
  UpdateProductInput,
} from "@/core/product/types";
import type {
  Product as ProductRow,
  ProductAttributeValue as ProductAttributeValueRow,
  ProductImage as ProductImageRow,
  ProductVariant as ProductVariantRow,
} from "@/generated/prisma/client";

interface ProductWithRelations extends ProductRow {
  images?: ProductImageRow[];
  variants?: ProductVariantRow[];
  values?: ProductAttributeValueRow[];
}

const PRODUCT_INCLUDE = {
  images: { orderBy: { order: "asc" } },
  variants: true,
  values: true,
} as const;

function tenantScope(tenantId: string | null): { tenantId: string } | Record<string, never> {
  return tenantId ? { tenantId } : {};
}

function isPrismaUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "P2002"
  );
}

function toDomain(row: ProductWithRelations): Product {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    price: row.price,
    compareAtPrice: row.compareAtPrice,
    costPrice: row.costPrice,
    stock: row.stock,
    sku: row.sku,
    brandId: row.brandId,
    typeId: row.typeId,
    taxCategoryId: row.taxCategoryId,
    weightKg: row.weightKg,
    dimensions: toRecord(row.dimensions),
    requiresShipping: row.requiresShipping,
    categoryId: row.categoryId,
    isPublished: row.isPublished,
    isFeatured: row.isFeatured,
    tags: row.tags,
    metadata: toRecord(row.metadata),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    images: (row.images ?? []).map((image) => ({
      id: image.id,
      url: image.url,
      alt: image.alt,
      order: image.order,
    })),
    variants: (row.variants ?? []).map((variant) => ({
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      name: variant.name,
      barcode: variant.barcode,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      costPrice: variant.costPrice,
      stock: variant.stock,
      options: toRecord(variant.options),
      isDefault: variant.isDefault,
      isActive: variant.isActive,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    })),
    attributeValues: (row.values ?? []).map((value) => ({
      id: value.id,
      productId: value.productId,
      attributeId: value.attributeId,
      value: value.value,
    })),
  };
}

function toPrismaCreate(
  tenantId: string | null,
  input: CreateProductInput,
): Prisma.ProductUncheckedCreateInput {
  return {
    tenantId: tenantId ?? null,
    name: input.name,
    slug: input.slug,
    description: input.description,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    costPrice: input.costPrice,
    stock: input.stock ?? 0,
    sku: input.sku,
    brandId: input.brandId,
    typeId: input.typeId,
    taxCategoryId: input.taxCategoryId,
    weightKg: input.weightKg,
    dimensions: toJson(input.dimensions),
    requiresShipping: input.requiresShipping ?? true,
    categoryId: input.categoryId,
    isPublished: input.isPublished ?? false,
    isFeatured: input.isFeatured ?? false,
    tags: input.tags ?? [],
    metadata: toJson(input.metadata),
    ...(input.attributeValues && input.attributeValues.length > 0
      ? {
          values: {
            create: input.attributeValues.map((value) => ({
              attributeId: value.attributeId,
              value: toJsonValue(value.value),
            })),
          },
        }
      : {}),
  };
}

function toPrismaUpdate(input: UpdateProductInput): Prisma.ProductUncheckedUpdateManyInput {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    price: input.price,
    compareAtPrice: input.compareAtPrice,
    costPrice: input.costPrice,
    stock: input.stock,
    sku: input.sku,
    brandId: input.brandId,
    typeId: input.typeId,
    taxCategoryId: input.taxCategoryId,
    weightKg: input.weightKg,
    dimensions: toJson(input.dimensions),
    requiresShipping: input.requiresShipping,
    categoryId: input.categoryId,
    isPublished: input.isPublished,
    isFeatured: input.isFeatured,
    tags: input.tags,
    metadata: toJson(input.metadata),
  };
}

function toWhere(filter: ProductListFilter): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = {
    ...tenantScope(filter.tenantId ?? null),
    ...(filter.categoryId ? { categoryId: filter.categoryId } : {}),
    ...(filter.brandId ? { brandId: filter.brandId } : {}),
    ...(filter.typeId ? { typeId: filter.typeId } : {}),
    ...(filter.isPublished !== undefined ? { isPublished: filter.isPublished } : {}),
    ...(filter.isFeatured !== undefined ? { isFeatured: filter.isFeatured } : {}),
    ...(filter.search ? { name: { contains: filter.search, mode: "insensitive" } } : {}),
  };
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    where.price = {
      ...(filter.minPrice !== undefined ? { gte: filter.minPrice } : {}),
      ...(filter.maxPrice !== undefined ? { lte: filter.maxPrice } : {}),
    };
  }
  if (filter.attributeFilters && filter.attributeFilters.length > 0) {
    where.AND = filter.attributeFilters.map((attributeFilter) => ({
      values: {
        some: {
          ...(attributeFilter.attributeId ? { attributeId: attributeFilter.attributeId } : {}),
          ...(attributeFilter.attributeSlug
            ? { attribute: { slug: attributeFilter.attributeSlug } }
            : {}),
          value: { equals: attributeFilter.value as Prisma.InputJsonValue },
        },
      },
    }));
  }
  return where;
}

export class PrismaProductRepository implements ProductRepository {
  async findById(tenantId: string | null, id: string): Promise<Product | null> {
    const row = (await prisma.product.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: PRODUCT_INCLUDE,
    })) as ProductWithRelations | null;
    return row ? toDomain(row) : null;
  }

  async findBySlug(tenantId: string | null, slug: string): Promise<Product | null> {
    const row = (await prisma.product.findFirst({
      where: { slug, ...tenantScope(tenantId) },
      include: PRODUCT_INCLUDE,
    })) as ProductWithRelations | null;
    return row ? toDomain(row) : null;
  }

  async list(filter: ProductListFilter): Promise<ProductListResult> {
    const page = filter.page ?? 1;
    const pageSize = filter.pageSize ?? 20;
    const where = toWhere(filter);
    const [rows, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: PRODUCT_INCLUDE,
      }),
      prisma.product.count({ where }),
    ]);
    return {
      items: rows.map((row) => toDomain(row as ProductWithRelations)),
      total,
      page,
      pageSize,
    };
  }

  async create(tenantId: string | null, input: CreateProductInput): Promise<Product> {
    try {
      const row = (await prisma.product.create({
        data: toPrismaCreate(tenantId, input),
        include: PRODUCT_INCLUDE,
      })) as ProductWithRelations;
      return toDomain(row);
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictError(`Product with the same slug or sku already exists`);
      }
      throw error;
    }
  }

  async update(tenantId: string | null, id: string, input: UpdateProductInput): Promise<Product> {
    try {
      const result = await prisma.product.updateMany({
        where: { id, ...tenantScope(tenantId) },
        data: toPrismaUpdate(input),
      });
      if (result.count === 0) {
        throw new NotFoundError(`Product ${id} not found`);
      }
    } catch (error) {
      if (isPrismaUniqueConstraintError(error)) {
        throw new ConflictError(`Product with the same slug or sku already exists`);
      }
      throw error;
    }
    const row = (await prisma.product.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: PRODUCT_INCLUDE,
    })) as ProductWithRelations | null;
    if (!row) {
      throw new NotFoundError(`Product ${id} not found`);
    }
    return toDomain(row);
  }

  async delete(tenantId: string | null, id: string): Promise<void> {
    const result = await prisma.product.deleteMany({
      where: { id, ...tenantScope(tenantId) },
    });
    if (result.count === 0) {
      throw new NotFoundError(`Product ${id} not found`);
    }
  }

  async adjustStock(tenantId: string | null, id: string, delta: number): Promise<void> {
    const result = await prisma.product.updateMany({
      where: { id, ...tenantScope(tenantId) },
      data: { stock: { increment: delta } },
    });
    if (result.count === 0) {
      throw new NotFoundError(`Product ${id} not found`);
    }
  }

  async setAttributeValues(
    tenantId: string | null,
    id: string,
    values: ProductAttributeValueInput[],
  ): Promise<Product> {
    return prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id, ...tenantScope(tenantId) },
        select: { id: true },
      });
      if (!product) {
        throw new NotFoundError(`Product ${id} not found`);
      }
      await tx.productAttributeValue.deleteMany({ where: { productId: id } });
      if (values.length > 0) {
        await tx.productAttributeValue.createMany({
          data: values.map((value) => ({
            productId: id,
            attributeId: value.attributeId,
            value: toJsonValue(value.value),
          })),
          skipDuplicates: true,
        });
      }
      const row = (await tx.product.findFirst({
        where: { id, ...tenantScope(tenantId) },
        include: PRODUCT_INCLUDE,
      })) as ProductWithRelations | null;
      if (!row) {
        throw new NotFoundError(`Product ${id} not found`);
      }
      return toDomain(row);
    });
  }
}

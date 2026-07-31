import { Prisma, prisma } from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/errors/platform-error";
import type { CollectionRepository } from "@/core/collection/collection-repository.interface";
import type {
  Collection,
  CollectionListFilter,
  CollectionListResult,
  CollectionRule,
  CreateCollectionInput,
  UpdateCollectionInput,
} from "@/core/collection/types";
import type {
  Collection as CollectionRow,
  CollectionRule as CollectionRuleRow,
} from "@/generated/prisma/client";

interface CollectionWithRelations extends CollectionRow {
  rules?: CollectionRuleRow[];
  products?: { id: string }[];
}

const COLLECTION_INCLUDE = {
  rules: true,
  products: { select: { id: true } },
} as const;

function tenantScope(tenantId: string | null): { tenantId: string } | Record<string, never> {
  return tenantId ? { tenantId } : {};
}

function toDomain(row: CollectionWithRelations): Collection {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    slug: row.slug,
    description: row.description,
    image: row.image,
    isManual: row.isManual,
    isPublished: row.isPublished,
    sortOrder: row.sortOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    rules: (row.rules ?? []).map((rule) => toRuleDomain(rule)),
    productIds: (row.products ?? []).map((product) => product.id),
  };
}

function toRuleDomain(row: CollectionRuleRow): CollectionRule {
  return {
    id: row.id,
    collectionId: row.collectionId,
    field: row.field,
    operator: row.operator,
    value: row.value,
    createdAt: row.createdAt,
  };
}

function toPrismaCreate(
  tenantId: string | null,
  input: CreateCollectionInput,
): Prisma.CollectionUncheckedCreateInput {
  return {
    tenantId: tenantId ?? null,
    name: input.name,
    slug: input.slug,
    description: input.description,
    image: input.image,
    isManual: input.isManual ?? true,
    isPublished: input.isPublished ?? false,
    sortOrder: input.sortOrder ?? 0,
    rules: input.rules?.length
      ? {
          create: input.rules.map((rule) => ({
            field: rule.field,
            operator: rule.operator,
            value: rule.value as Prisma.InputJsonValue,
          })),
        }
      : undefined,
    products: input.productIds?.length
      ? { connect: input.productIds.map((id) => ({ id })) }
      : undefined,
  };
}

function toPrismaUpdate(input: UpdateCollectionInput): Prisma.CollectionUpdateManyMutationInput {
  return {
    name: input.name,
    slug: input.slug,
    description: input.description,
    image: input.image,
    isManual: input.isManual,
    isPublished: input.isPublished,
    sortOrder: input.sortOrder,
  };
}

function toFilter(
  tenantId: string | null,
  filter?: CollectionListFilter,
): Prisma.CollectionWhereInput {
  return {
    ...tenantScope(tenantId),
    ...(filter?.isPublished !== undefined ? { isPublished: filter.isPublished } : {}),
  };
}

export class PrismaCollectionRepository implements CollectionRepository {
  async findById(tenantId: string | null, id: string): Promise<Collection | null> {
    const row = (await prisma.collection.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: COLLECTION_INCLUDE,
    })) as CollectionWithRelations | null;
    return row ? toDomain(row) : null;
  }

  async findBySlug(tenantId: string | null, slug: string): Promise<Collection | null> {
    const row = (await prisma.collection.findFirst({
      where: { slug, ...tenantScope(tenantId) },
      include: COLLECTION_INCLUDE,
    })) as CollectionWithRelations | null;
    return row ? toDomain(row) : null;
  }

  async list(
    tenantId: string | null,
    filter?: CollectionListFilter,
  ): Promise<CollectionListResult> {
    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    const where = toFilter(tenantId, filter);
    const [rows, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        orderBy: { sortOrder: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: COLLECTION_INCLUDE,
      }),
      prisma.collection.count({ where }),
    ]);
    return {
      items: rows.map((row) => toDomain(row as CollectionWithRelations)),
      total,
      page,
      pageSize,
    };
  }

  async create(tenantId: string | null, input: CreateCollectionInput): Promise<Collection> {
    const row = (await prisma.collection.create({
      data: toPrismaCreate(tenantId, input),
      include: COLLECTION_INCLUDE,
    })) as CollectionWithRelations;
    return toDomain(row);
  }

  async update(
    tenantId: string | null,
    id: string,
    input: UpdateCollectionInput,
  ): Promise<Collection> {
    const result = await prisma.collection.updateMany({
      where: { id, ...tenantScope(tenantId) },
      data: toPrismaUpdate(input),
    });
    if (result.count === 0) {
      throw new NotFoundError(`Collection ${id} not found`);
    }
    const row = (await prisma.collection.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: COLLECTION_INCLUDE,
    })) as CollectionWithRelations | null;
    if (!row) {
      throw new NotFoundError(`Collection ${id} not found`);
    }
    return toDomain(row);
  }

  async delete(tenantId: string | null, id: string): Promise<void> {
    const result = await prisma.collection.deleteMany({
      where: { id, ...tenantScope(tenantId) },
    });
    if (result.count === 0) {
      throw new NotFoundError(`Collection ${id} not found`);
    }
  }

  async addProduct(tenantId: string | null, id: string, productId: string): Promise<void> {
    const collection = await this.findById(tenantId, id);
    if (!collection) {
      throw new NotFoundError(`Collection ${id} not found`);
    }
    await prisma.collection.update({
      where: { id },
      data: { products: { connect: { id: productId } } },
    });
  }

  async removeProduct(tenantId: string | null, id: string, productId: string): Promise<void> {
    const collection = await this.findById(tenantId, id);
    if (!collection) {
      throw new NotFoundError(`Collection ${id} not found`);
    }
    await prisma.collection.update({
      where: { id },
      data: { products: { disconnect: { id: productId } } },
    });
  }
}

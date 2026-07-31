import { prisma } from "@/shared/lib/prisma";
import type { AttributeRepository } from "@/core/product/attribute-repository.interface";
import type { Attribute } from "@/core/product/attribute-types";
import type { Attribute as AttributeRow } from "@/generated/prisma/client";

function tenantScope(tenantId: string | null): { tenantId: string } | Record<string, never> {
  return tenantId ? { tenantId } : {};
}

function toDomain(row: AttributeRow): Attribute {
  return {
    id: row.id,
    tenantId: row.tenantId,
    name: row.name,
    slug: row.slug,
    type: row.type,
    unit: row.unit,
    required: row.required,
    filterable: row.filterable,
    sortable: row.sortable,
    group: row.group,
    options: row.options,
    isGlobal: row.isGlobal,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaAttributeRepository implements AttributeRepository {
  async findById(tenantId: string | null, id: string): Promise<Attribute | null> {
    const row = await prisma.attribute.findFirst({
      where: { id, ...tenantScope(tenantId) },
    });
    return row ? toDomain(row) : null;
  }

  async findBySlug(tenantId: string | null, slug: string): Promise<Attribute | null> {
    const row = await prisma.attribute.findFirst({
      where: { slug, ...tenantScope(tenantId) },
    });
    return row ? toDomain(row) : null;
  }
}

import { Prisma, prisma } from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/errors/platform-error";
import { toJson, toRecord } from "@/shared/lib/json";
import type { TenantRepository } from "@/core/tenant/tenant-repository.interface";
import type {
  CreateTenantInput,
  Tenant,
  TenantStatus,
  UpdateTenantInput,
} from "@/core/tenant/types";
import type { Tenant as TenantRow } from "@/generated/prisma/client";

function toDomain(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    domain: row.domain,
    locale: row.locale,
    currency: row.currency,
    countryCode: row.countryCode,
    status: row.status as TenantStatus,
    config: toRecord(row.config),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toPrismaCreate(input: CreateTenantInput): Prisma.TenantCreateInput {
  return {
    name: input.name,
    slug: input.slug,
    domain: input.domain,
    locale: input.locale,
    currency: input.currency,
    countryCode: input.countryCode,
    status: input.status as TenantRow["status"],
    config: toJson(input.config),
  };
}

function toPrismaUpdate(input: UpdateTenantInput): Prisma.TenantUpdateInput {
  return {
    name: input.name,
    slug: input.slug,
    domain: input.domain,
    locale: input.locale,
    currency: input.currency,
    countryCode: input.countryCode,
    status: input.status as TenantRow["status"] | undefined,
    config: toJson(input.config),
  };
}

export class PrismaTenantRepository implements TenantRepository {
  async findById(id: string): Promise<Tenant | null> {
    const row = await prisma.tenant.findUnique({ where: { id } });
    return row ? toDomain(row) : null;
  }

  async findBySlug(slug: string): Promise<Tenant | null> {
    const row = await prisma.tenant.findUnique({ where: { slug } });
    return row ? toDomain(row) : null;
  }

  async findByDomain(domain: string): Promise<Tenant | null> {
    const row = await prisma.tenant.findUnique({ where: { domain } });
    return row ? toDomain(row) : null;
  }

  async list(): Promise<Tenant[]> {
    const rows = await prisma.tenant.findMany({ orderBy: { createdAt: "asc" } });
    return rows.map(toDomain);
  }

  async create(input: CreateTenantInput): Promise<Tenant> {
    const row = await prisma.tenant.create({ data: toPrismaCreate(input) });
    return toDomain(row);
  }

  async update(id: string, input: UpdateTenantInput): Promise<Tenant> {
    const result = await prisma.tenant.updateMany({
      where: { id },
      data: toPrismaUpdate(input),
    });
    if (result.count === 0) {
      throw new NotFoundError(`Tenant ${id} not found`);
    }
    const row = await prisma.tenant.findUnique({ where: { id } });
    if (!row) {
      throw new NotFoundError(`Tenant ${id} not found`);
    }
    return toDomain(row);
  }
}

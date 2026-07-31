import { Prisma, prisma } from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/errors/platform-error";
import { toJson, toRecord } from "@/shared/lib/json";
import type { CouponRepository } from "@/core/coupon/coupon-repository.interface";
import type {
  Coupon,
  CouponType,
  CouponUsage,
  CreateCouponInput,
  UpdateCouponInput,
} from "@/core/coupon/types";
import type { Coupon as CouponRow, CouponUsage as CouponUsageRow } from "@/generated/prisma/client";

function tenantScope(tenantId: string | null): { tenantId: string } | Record<string, never> {
  return tenantId ? { tenantId } : {};
}

function toDomain(row: CouponRow): Coupon {
  return {
    id: row.id,
    tenantId: row.tenantId,
    code: row.code,
    type: row.type as CouponType,
    value: row.value,
    minOrderAmount: row.minOrderAmount,
    maxDiscountAmount: row.maxDiscountAmount,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    usageLimit: row.usageLimit,
    usageCount: row.usageCount,
    perCustomerLimit: row.perCustomerLimit,
    isActive: row.isActive,
    appliesTo: toRecord(row.appliesTo),
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function toUsageDomain(row: CouponUsageRow): CouponUsage {
  return {
    id: row.id,
    couponId: row.couponId,
    userId: row.userId,
    orderId: row.orderId,
    usedAt: row.usedAt,
  };
}

function toPrismaCreate(
  tenantId: string | null,
  input: CreateCouponInput,
): Prisma.CouponUncheckedCreateInput {
  return {
    tenantId: tenantId ?? null,
    code: input.code,
    type: input.type as CouponRow["type"],
    value: input.value,
    minOrderAmount: input.minOrderAmount,
    maxDiscountAmount: input.maxDiscountAmount,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    usageLimit: input.usageLimit,
    perCustomerLimit: input.perCustomerLimit,
    isActive: input.isActive ?? true,
    appliesTo: toJson(input.appliesTo),
    description: input.description,
  };
}

function toPrismaUpdate(input: UpdateCouponInput): Prisma.CouponUpdateManyMutationInput {
  return {
    code: input.code,
    type: input.type as CouponRow["type"] | undefined,
    value: input.value,
    minOrderAmount: input.minOrderAmount,
    maxDiscountAmount: input.maxDiscountAmount,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    usageLimit: input.usageLimit,
    perCustomerLimit: input.perCustomerLimit,
    isActive: input.isActive,
    appliesTo: toJson(input.appliesTo),
    description: input.description,
  };
}

export class PrismaCouponRepository implements CouponRepository {
  async findById(tenantId: string | null, id: string): Promise<Coupon | null> {
    const row = await prisma.coupon.findFirst({
      where: { id, ...tenantScope(tenantId) },
    });
    return row ? toDomain(row) : null;
  }

  async findByCode(tenantId: string | null, code: string): Promise<Coupon | null> {
    const row = await prisma.coupon.findFirst({
      where: { code, ...tenantScope(tenantId) },
    });
    return row ? toDomain(row) : null;
  }

  async list(tenantId: string | null): Promise<Coupon[]> {
    const rows = await prisma.coupon.findMany({
      where: tenantScope(tenantId),
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDomain);
  }

  async create(tenantId: string | null, input: CreateCouponInput): Promise<Coupon> {
    const row = await prisma.coupon.create({
      data: toPrismaCreate(tenantId, input),
    });
    return toDomain(row);
  }

  async update(tenantId: string | null, id: string, input: UpdateCouponInput): Promise<Coupon> {
    const result = await prisma.coupon.updateMany({
      where: { id, ...tenantScope(tenantId) },
      data: toPrismaUpdate(input),
    });
    if (result.count === 0) {
      throw new NotFoundError(`Coupon ${id} not found`);
    }
    const row = await prisma.coupon.findFirst({
      where: { id, ...tenantScope(tenantId) },
    });
    if (!row) {
      throw new NotFoundError(`Coupon ${id} not found`);
    }
    return toDomain(row);
  }

  async recordUsage(
    tenantId: string | null,
    id: string,
    usage?: { userId?: string | null; orderId?: string | null },
  ): Promise<CouponUsage> {
    const coupon = await this.findById(tenantId, id);
    if (!coupon) {
      throw new NotFoundError(`Coupon ${id} not found`);
    }
    const [, usageRow] = await prisma.$transaction([
      prisma.coupon.update({
        where: { id },
        data: { usageCount: { increment: 1 } },
      }),
      prisma.couponUsage.create({
        data: {
          couponId: id,
          userId: usage?.userId ?? null,
          orderId: usage?.orderId ?? null,
        },
      }),
    ]);
    return toUsageDomain(usageRow);
  }
}

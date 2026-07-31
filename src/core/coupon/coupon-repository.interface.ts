import type { Coupon, CouponUsage, CreateCouponInput, UpdateCouponInput } from "./types";

export interface CouponRepository {
  findById(tenantId: string | null, id: string): Promise<Coupon | null>;
  findByCode(tenantId: string | null, code: string): Promise<Coupon | null>;
  list(tenantId: string | null): Promise<Coupon[]>;
  create(tenantId: string | null, input: CreateCouponInput): Promise<Coupon>;
  update(tenantId: string | null, id: string, input: UpdateCouponInput): Promise<Coupon>;
  recordUsage(
    tenantId: string | null,
    id: string,
    usage?: { userId?: string | null; orderId?: string | null },
  ): Promise<CouponUsage>;
}

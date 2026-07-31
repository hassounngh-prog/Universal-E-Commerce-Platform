export type CouponType = "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";

export interface Coupon {
  id: string;
  tenantId: string | null;
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount: number | null;
  maxDiscountAmount: number | null;
  startsAt: Date | null;
  endsAt: Date | null;
  usageLimit: number | null;
  usageCount: number;
  perCustomerLimit: number | null;
  isActive: boolean;
  appliesTo: Record<string, unknown> | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CouponUsage {
  id: string;
  couponId: string;
  userId: string | null;
  orderId: string | null;
  usedAt: Date;
}

export interface CreateCouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  isActive?: boolean;
  appliesTo?: Record<string, unknown> | null;
  description?: string | null;
}

export interface UpdateCouponInput {
  code?: string;
  type?: CouponType;
  value?: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
  startsAt?: Date | null;
  endsAt?: Date | null;
  usageLimit?: number | null;
  perCustomerLimit?: number | null;
  isActive?: boolean;
  appliesTo?: Record<string, unknown> | null;
  description?: string | null;
}

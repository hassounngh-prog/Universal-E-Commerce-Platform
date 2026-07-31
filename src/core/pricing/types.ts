import type { CouponType } from "@/core/coupon/types";

export interface TierPrice {
  minQuantity: number;
  price: number;
}

export interface PricingLine {
  id: string;
  unitPrice: number;
  quantity: number;
  tierPrices?: TierPrice[];
  taxCategoryId?: string | null;
  taxable?: boolean;
}

export interface CouponInput {
  code: string;
  type: CouponType;
  value: number;
  minOrderAmount?: number | null;
  maxDiscountAmount?: number | null;
}

export interface PricingLineResult {
  id: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  tax: number;
}

export interface AppliedCoupon {
  code: string;
  type: CouponType;
  value: number;
  discountAmount: number;
}

export interface PriceBreakdown {
  currency: string;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  tax: number;
  total: number;
}

export interface PricingResult {
  currency: string;
  lines: PricingLineResult[];
  breakdown: PriceBreakdown;
  appliedCoupon: AppliedCoupon | null;
  couponError?: string;
}

export interface CalculatePriceInput {
  currency: string;
  lines: PricingLine[];
  coupon?: CouponInput | null;
  shippingCost?: number;
  taxRate?: number;
  taxRates?: Record<string, number>;
}

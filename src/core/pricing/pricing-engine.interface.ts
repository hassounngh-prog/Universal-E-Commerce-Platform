import type {
  CalculatePriceInput,
  CouponInput,
  PricingLine,
  PricingResult,
} from "./types";

export interface PricingEngine {
  readonly id: string;
  readonly name: string;
  effectiveUnitPrice(line: PricingLine, quantity: number): number;
  isCouponEligible(subtotal: number, coupon: CouponInput): boolean;
  calculateDiscount(subtotal: number, shippingCost: number, coupon: CouponInput): number;
  calculatePrice(input: CalculatePriceInput): Promise<PricingResult>;
}

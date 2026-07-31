import type {
  CalculatePriceInput,
  CouponInput,
  PricingLine,
  PricingLineResult,
  PricingResult,
  PriceBreakdown,
  TierPrice,
} from "./types";
import type { PricingEngine } from "./pricing-engine.interface";

function round(value: number): number {
  return Math.round(value);
}

function sortTiers(tiers: TierPrice[] | undefined): TierPrice[] {
  if (!tiers) return [];
  return [...tiers].sort((a, b) => a.minQuantity - b.minQuantity);
}

export class DefaultPricingEngine implements PricingEngine {
  readonly id = "default";
  readonly name = "Default Pricing Engine";

  effectiveUnitPrice(line: PricingLine, quantity: number): number {
    const tiers = sortTiers(line.tierPrices);
    let price = line.unitPrice;
    for (const tier of tiers) {
      if (quantity >= tier.minQuantity) {
        price = tier.price;
      }
    }
    return price;
  }

  isCouponEligible(subtotal: number, coupon: CouponInput): boolean {
    if (coupon.minOrderAmount === null || coupon.minOrderAmount === undefined) {
      return true;
    }
    return subtotal >= coupon.minOrderAmount;
  }

  calculateDiscount(subtotal: number, shippingCost: number, coupon: CouponInput): number {
    if (!this.isCouponEligible(subtotal, coupon)) {
      return 0;
    }

    switch (coupon.type) {
      case "PERCENTAGE": {
        const discount = round((subtotal * coupon.value) / 100);
        const capped =
          coupon.maxDiscountAmount === null || coupon.maxDiscountAmount === undefined
            ? discount
            : Math.min(discount, coupon.maxDiscountAmount);
        return Math.min(capped, subtotal);
      }
      case "FIXED_AMOUNT":
        return Math.min(coupon.value, subtotal);
      case "FREE_SHIPPING":
        return Math.max(0, shippingCost);
      default:
        return 0;
    }
  }

  async calculatePrice(input: CalculatePriceInput): Promise<PricingResult> {
    const currency = input.currency;
    const taxRate = input.taxRate ?? 0;
    const taxRates = input.taxRates ?? {};

    const lines: PricingLineResult[] = input.lines.map((line) => {
      const unitPrice = this.effectiveUnitPrice(line, line.quantity);
      const lineTotal = unitPrice * line.quantity;
      const taxable = line.taxable !== false;
      const categoryRate =
        line.taxCategoryId !== null && line.taxCategoryId !== undefined
          ? taxRates[line.taxCategoryId]
          : undefined;
      const rate = categoryRate ?? taxRate;
      const tax = taxable ? round(lineTotal * (rate / 100)) : 0;
      return { id: line.id, unitPrice, quantity: line.quantity, lineTotal, tax };
    });

    const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
    const shippingCost = input.shippingCost ?? 0;

    let appliedCoupon = null;
    let couponError: string | undefined;
    let discountAmount = 0;

    if (input.coupon) {
      const coupon = input.coupon;
      if (!this.isCouponEligible(subtotal, coupon)) {
        couponError = `Coupon ${coupon.code} requires a minimum order amount of ${coupon.minOrderAmount}`;
      } else {
        discountAmount = this.calculateDiscount(subtotal, shippingCost, coupon);
        appliedCoupon = {
          code: coupon.code,
          type: coupon.type,
          value: coupon.value,
          discountAmount,
        };
      }
    }

    const tax = lines.reduce((sum, line) => sum + line.tax, 0);
    const total = subtotal - discountAmount + shippingCost + tax;

    const breakdown: PriceBreakdown = {
      currency,
      subtotal,
      discountAmount,
      shippingCost,
      tax,
      total,
    };

    const result: PricingResult = {
      currency,
      lines,
      breakdown,
      appliedCoupon,
    };

    if (couponError) {
      result.couponError = couponError;
    }

    return result;
  }
}

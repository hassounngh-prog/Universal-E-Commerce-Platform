import { describe, expect, it } from "vitest";
import { DefaultPricingEngine } from "./default-pricing-engine";
import type { CouponInput, PricingLine } from "./types";

const engine = new DefaultPricingEngine();

function line(overrides: Partial<PricingLine>): PricingLine {
  return { id: "line-1", unitPrice: 1000, quantity: 1, ...overrides };
}

function coupon(overrides: Partial<CouponInput>): CouponInput {
  return { code: "SAVE10", type: "PERCENTAGE", value: 10, ...overrides };
}

describe("DefaultPricingEngine", () => {
  describe("effectiveUnitPrice", () => {
    it("returns unitPrice when no tier prices exist", () => {
      expect(engine.effectiveUnitPrice(line({}), 5)).toBe(1000);
    });

    it("applies the highest tier whose minQuantity is met", () => {
      const l = line({
        unitPrice: 1000,
        tierPrices: [
          { minQuantity: 5, price: 900 },
          { minQuantity: 10, price: 800 },
        ],
      });
      expect(engine.effectiveUnitPrice(l, 1)).toBe(1000);
      expect(engine.effectiveUnitPrice(l, 5)).toBe(900);
      expect(engine.effectiveUnitPrice(l, 12)).toBe(800);
    });

    it("does not mutate the input tier order", () => {
      const l = line({
        unitPrice: 1000,
        tierPrices: [
          { minQuantity: 10, price: 800 },
          { minQuantity: 5, price: 900 },
        ],
      });
      expect(engine.effectiveUnitPrice(l, 7)).toBe(900);
      expect(l.tierPrices?.[0]?.minQuantity).toBe(10);
    });
  });

  describe("isCouponEligible", () => {
    it("is eligible when no minimum order amount is set", () => {
      expect(engine.isCouponEligible(0, coupon({ minOrderAmount: null }))).toBe(true);
    });

    it("is eligible when subtotal meets the minimum", () => {
      expect(engine.isCouponEligible(5000, coupon({ minOrderAmount: 5000 }))).toBe(true);
    });

    it("is not eligible below the minimum", () => {
      expect(engine.isCouponEligible(4999, coupon({ minOrderAmount: 5000 }))).toBe(false);
    });
  });

  describe("calculateDiscount", () => {
    it("computes percentage discount", () => {
      expect(engine.calculateDiscount(10000, 0, coupon({ value: 10 }))).toBe(1000);
    });

    it("caps percentage discount at maxDiscountAmount", () => {
      const result = engine.calculateDiscount(10000, 0, coupon({ value: 10, maxDiscountAmount: 500 }));
      expect(result).toBe(500);
    });

    it("never discounts more than the subtotal", () => {
      expect(engine.calculateDiscount(200, 0, coupon({ value: 200 }))).toBe(200);
    });

    it("applies fixed amount discount", () => {
      expect(engine.calculateDiscount(10000, 0, coupon({ type: "FIXED_AMOUNT", value: 1500 }))).toBe(1500);
    });

    it("returns 0 when not eligible", () => {
      expect(engine.calculateDiscount(1000, 0, coupon({ minOrderAmount: 5000 }))).toBe(0);
    });

    it("for FREE_SHIPPING, discounts the shipping cost", () => {
      expect(engine.calculateDiscount(10000, 700, coupon({ type: "FREE_SHIPPING", value: 0 }))).toBe(700);
    });
  });

  describe("calculatePrice", () => {
    it("computes a full breakdown with tax", async () => {
      const result = await engine.calculatePrice({
        currency: "USD",
        lines: [line({ id: "a", unitPrice: 1000, quantity: 2, taxCategoryId: "t1" })],
        shippingCost: 500,
        taxRate: 10,
      });

      expect(result.breakdown).toEqual({
        currency: "USD",
        subtotal: 2000,
        discountAmount: 0,
        shippingCost: 500,
        tax: 200,
        total: 2700,
      });
      expect(result.lines).toEqual([
        { id: "a", unitPrice: 1000, quantity: 2, lineTotal: 2000, tax: 200 },
      ]);
      expect(result.appliedCoupon).toBeNull();
    });

    it("applies tier pricing inside calculatePrice", async () => {
      const result = await engine.calculatePrice({
        currency: "USD",
        lines: [
          line({
            id: "a",
            unitPrice: 1000,
            quantity: 10,
            tierPrices: [{ minQuantity: 10, price: 800 }],
          }),
        ],
      });

      expect(result.lines[0]!.unitPrice).toBe(800);
      expect(result.breakdown.subtotal).toBe(8000);
    });

    it("applies a percentage coupon with cap", async () => {
      const result = await engine.calculatePrice({
        currency: "USD",
        lines: [line({ id: "a", unitPrice: 1000, quantity: 10 })],
        coupon: coupon({ value: 20, maxDiscountAmount: 1500 }),
      });

      expect(result.appliedCoupon).toEqual({
        code: "SAVE10",
        type: "PERCENTAGE",
        value: 20,
        discountAmount: 1500,
      });
      expect(result.breakdown.discountAmount).toBe(1500);
      expect(result.breakdown.total).toBe(8500);
    });

    it("applies FREE_SHIPPING coupon to shipping", async () => {
      const result = await engine.calculatePrice({
        currency: "USD",
        lines: [line({ id: "a", unitPrice: 1000, quantity: 2 })],
        shippingCost: 1200,
        coupon: coupon({ type: "FREE_SHIPPING", value: 0 }),
      });

      expect(result.appliedCoupon?.discountAmount).toBe(1200);
      expect(result.breakdown.shippingCost).toBe(1200);
      expect(result.breakdown.total).toBe(2000);
    });

    it("does not apply coupon below minimum order amount", async () => {
      const result = await engine.calculatePrice({
        currency: "USD",
        lines: [line({ id: "a", unitPrice: 1000, quantity: 1 })],
        coupon: coupon({ minOrderAmount: 5000 }),
      });

      expect(result.appliedCoupon).toBeNull();
      expect(result.breakdown.discountAmount).toBe(0);
      expect(result.couponError).toContain("minimum order amount");
    });

    it("uses per-category tax rate over the global rate", async () => {
      const result = await engine.calculatePrice({
        currency: "USD",
        lines: [
          line({ id: "a", unitPrice: 1000, quantity: 1, taxCategoryId: "t1" }),
          line({ id: "b", unitPrice: 1000, quantity: 1, taxCategoryId: "t2" }),
        ],
        taxRate: 5,
        taxRates: { t1: 20, t2: 10 },
      });

      expect(result.lines[0]!.tax).toBe(200);
      expect(result.lines[1]!.tax).toBe(100);
      expect(result.breakdown.tax).toBe(300);
    });

    it("skips tax for non-taxable lines", async () => {
      const result = await engine.calculatePrice({
        currency: "USD",
        lines: [line({ id: "a", unitPrice: 1000, quantity: 1, taxable: false })],
        taxRate: 10,
      });

      expect(result.lines[0]!.tax).toBe(0);
      expect(result.breakdown.tax).toBe(0);
    });
  });
});

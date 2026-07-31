import { describe, expect, it, vi } from "vitest";
import { PostgresTaxProvider } from "./postgres-tax-provider";
import type { TaxRequest } from "@/core/tax/tax-provider.interface";

const mocks = vi.hoisted(() => ({
  mockFindCategory: vi.fn(),
  mockFindRate: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    taxCategory: {
      findFirst: mocks.mockFindCategory,
    },
    taxRate: {
      findFirst: mocks.mockFindRate,
    },
  },
}));

const settings = { defaultRate: 0, currency: "usd" };

const request: TaxRequest = {
  toAddress: { countryCode: "US", region: "CA", postalCode: "90210" },
  currency: "usd",
  lines: [{ id: "line-1", amount: { amount: 10000, currency: "usd" }, productType: "physical" }],
};

describe("PostgresTaxProvider", () => {
  it("implements the TaxProvider contract", () => {
    const provider = new PostgresTaxProvider(settings);
    expect(provider.id).toBe("postgres");
    expect(provider.name).toContain("Postgres");
    expect(typeof provider.calculate).toBe("function");
  });

  it("calculates tax per line from the matched rate", async () => {
    mocks.mockFindCategory
      .mockResolvedValueOnce({ id: "cat-1", code: "physical" })
      .mockResolvedValue({ id: "cat-default", code: "default" });
    mocks.mockFindRate
      .mockResolvedValueOnce({
        id: "rate-1",
        country: "US",
        region: "CA",
        postalCode: "90210",
        rate: "0.0825",
        isCompound: false,
        appliesToShipping: false,
        priority: 0,
      })
      .mockResolvedValue(null);
    const provider = new PostgresTaxProvider(settings);

    const result = await provider.calculate(request);

    expect(result.success).toBe(true);
    expect(result.lines).toHaveLength(1);
    expect(result.lines[0]).toEqual({
      id: "line-1",
      amount: { amount: 825, currency: "usd" },
      rate: 0.0825,
      taxType: "sales",
      jurisdiction: "US",
    });
    expect(result.totalTax).toEqual({ amount: 825, currency: "usd" });
  });

  it("applies the default rate when no category or rate matches", async () => {
    mocks.mockFindCategory.mockResolvedValue(null);
    const provider = new PostgresTaxProvider({ ...settings, defaultRate: 0.05 });

    const result = await provider.calculate(request);

    expect(result.success).toBe(true);
    expect(result.lines[0]?.amount.amount).toBe(500);
    expect(result.totalTax.amount).toBe(500);
  });

  it("adds compound tax on top of the simple-taxed base", async () => {
    mocks.mockFindCategory
      .mockResolvedValueOnce({ id: "cat-1", code: "physical" })
      .mockResolvedValueOnce({ id: "cat-default", code: "default" });
    mocks.mockFindRate
      .mockResolvedValueOnce({
        id: "rate-1",
        rate: "0.08",
        isCompound: false,
        appliesToShipping: false,
      })
      .mockResolvedValueOnce({
        id: "rate-2",
        rate: "0.02",
        isCompound: true,
        appliesToShipping: false,
      });
    const provider = new PostgresTaxProvider(settings);

    const result = await provider.calculate(request);

    const simpleTax = result.lines.find((line) => line.id === "line-1");
    const compoundTax = result.lines.find((line) => line.id === "shipping-compound");

    expect(simpleTax?.amount.amount).toBe(800);
    expect(compoundTax?.amount.amount).toBe(200);
    expect(result.totalTax.amount).toBe(1000);
  });

  it("returns zero tax when rates do not match", async () => {
    mocks.mockFindCategory.mockResolvedValue({ id: "cat-1", code: "physical" });
    mocks.mockFindRate.mockResolvedValue(null);
    const provider = new PostgresTaxProvider(settings);

    const result = await provider.calculate(request);

    expect(result.success).toBe(true);
    expect(result.lines).toHaveLength(0);
    expect(result.totalTax.amount).toBe(0);
  });

  it("queries with country, region and postal specificity", async () => {
    mocks.mockFindCategory.mockResolvedValue({ id: "cat-1", code: "physical" });
    mocks.mockFindRate.mockResolvedValue(null);
    const provider = new PostgresTaxProvider(settings);

    await provider.calculate(request);

    expect(mocks.mockFindRate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          country: "US",
          region: "CA",
          OR: [{ postalCode: "90210" }, { postalCode: null }],
          isCompound: false,
          appliesToShipping: false,
        }),
      }),
    );
  });
});

import { describe, expect, it, vi } from "vitest";
import { PrismaCouponRepository } from "./coupon-repository";
import { NotFoundError } from "@/shared/errors/platform-error";
import { Prisma } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockFindMany: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockCouponUpdate: vi.fn(),
  mockCouponUsageCreate: vi.fn(),
  mockTransaction: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    coupon: {
      findFirst: mocks.mockFindFirst,
      findMany: mocks.mockFindMany,
      create: mocks.mockCreate,
      updateMany: mocks.mockUpdateMany,
      update: mocks.mockCouponUpdate,
    },
    couponUsage: {
      create: mocks.mockCouponUsageCreate,
    },
    $transaction: mocks.mockTransaction,
  },
  Prisma: {},
}));

const couponRow = {
  id: "cp1",
  tenantId: "t1",
  code: "WELCOME10",
  type: "PERCENTAGE",
  value: 10,
  minOrderAmount: null,
  maxDiscountAmount: null,
  startsAt: null,
  endsAt: null,
  usageLimit: null,
  usageCount: 0,
  perCustomerLimit: 1,
  isActive: true,
  appliesTo: null,
  description: "Welcome discount",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const usageRow = {
  id: "cu1",
  couponId: "cp1",
  userId: "u1",
  orderId: "o1",
  usedAt: new Date("2026-01-02T00:00:00Z"),
};

describe("PrismaCouponRepository", () => {
  const repo = new PrismaCouponRepository();

  it("implements the CouponRepository contract", () => {
    for (const method of ["findById", "findByCode", "list", "create", "update", "recordUsage"]) {
      expect(typeof (repo as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("finds a coupon by code scoped to the tenant", async () => {
    mocks.mockFindFirst.mockResolvedValue(couponRow);

    const coupon = await repo.findByCode("t1", "WELCOME10");

    expect(coupon).toMatchObject({ id: "cp1", code: "WELCOME10", type: "PERCENTAGE", value: 10 });
    expect(mocks.mockFindFirst).toHaveBeenCalledWith({
      where: { code: "WELCOME10", tenantId: "t1" },
    });
  });

  it("maps an appliesTo JSON object to the domain type", async () => {
    mocks.mockFindFirst.mockResolvedValue({ ...couponRow, appliesTo: { productIds: ["p1"] } });

    const coupon = await repo.findById("t1", "cp1");

    expect(coupon?.appliesTo).toEqual({ productIds: ["p1"] });
  });

  it("creates a coupon serializing appliesTo as JSON", async () => {
    mocks.mockCreate.mockResolvedValue(couponRow);

    await repo.create("t1", { code: "WELCOME10", type: "PERCENTAGE", value: 10, appliesTo: null });

    expect(mocks.mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        code: "WELCOME10",
        type: "PERCENTAGE",
        value: 10,
        appliesTo: Prisma.JsonNull,
        isActive: true,
      }),
    });
  });

  it("throws NotFoundError when updating a missing coupon", async () => {
    mocks.mockUpdateMany.mockResolvedValue({ count: 0 });

    await expect(repo.update("t1", "cp1", { value: 20 })).rejects.toThrow(NotFoundError);
  });

  it("records usage inside a transaction, incrementing usageCount", async () => {
    mocks.mockFindFirst.mockResolvedValue(couponRow);
    mocks.mockCouponUpdate.mockResolvedValue({ ...couponRow, usageCount: 1 });
    mocks.mockCouponUsageCreate.mockResolvedValue(usageRow);
    mocks.mockTransaction.mockImplementation((queries: unknown[]) => Promise.all(queries));

    const usage = await repo.recordUsage("t1", "cp1", { userId: "u1", orderId: "o1" });

    expect(mocks.mockCouponUpdate).toHaveBeenCalledWith({
      where: { id: "cp1" },
      data: { usageCount: { increment: 1 } },
    });
    expect(mocks.mockCouponUsageCreate).toHaveBeenCalledWith({
      data: { couponId: "cp1", userId: "u1", orderId: "o1" },
    });
    expect(usage).toEqual(usageRow);
  });

  it("throws NotFoundError when recording usage for a missing coupon", async () => {
    mocks.mockFindFirst.mockResolvedValue(null);

    await expect(repo.recordUsage("t1", "cp1", {})).rejects.toThrow(NotFoundError);
  });
});

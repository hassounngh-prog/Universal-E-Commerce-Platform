import { describe, expect, it, vi } from "vitest";
import { PrismaOrderRepository } from "./order-repository";
import { NotFoundError } from "@/shared/errors/platform-error";
import { Prisma } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdateMany: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    order: {
      findFirst: mocks.mockFindFirst,
      findMany: mocks.mockFindMany,
      count: mocks.mockCount,
      create: mocks.mockCreate,
      updateMany: mocks.mockUpdateMany,
    },
  },
  Prisma: {},
}));

const itemRow = {
  id: "oi1",
  orderId: "o1",
  productId: "p1",
  variantId: null,
  name: "Anime Figurine",
  price: 2999,
  quantity: 1,
  image: null,
};

const addressRow = {
  id: "oa1",
  orderId: "o1",
  label: null,
  line1: "1 Otaku St",
  line2: null,
  city: "Tokyo",
  state: "Tokyo",
  postalCode: "100-0001",
  country: "JP",
};

const orderRow = {
  id: "o1",
  tenantId: "t1",
  orderNumber: "AN-1001",
  userId: "u1",
  email: "buyer@example.com",
  status: "PENDING",
  subtotal: 2999,
  discountAmount: 0,
  shippingCost: 500,
  tax: 270,
  total: 3769,
  currency: "usd",
  taxBreakdown: null,
  shippingCarrier: null,
  shippingMethod: null,
  trackingNumber: null,
  notes: null,
  paidAt: null,
  shippedAt: null,
  deliveredAt: null,
  cancelledAt: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("PrismaOrderRepository", () => {
  const repo = new PrismaOrderRepository();

  it("implements the OrderRepository contract", () => {
    for (const method of ["findById", "findByNumber", "list", "create", "update"]) {
      expect(typeof (repo as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("maps an order with nested items and address to the domain type", async () => {
    mocks.mockFindFirst.mockResolvedValue({ ...orderRow, items: [itemRow], address: addressRow });

    const order = await repo.findById("t1", "o1");

    expect(order).toMatchObject({
      id: "o1",
      orderNumber: "AN-1001",
      status: "PENDING",
      total: 3769,
      items: [{ id: "oi1", name: "Anime Figurine", price: 2999, quantity: 1 }],
      address: { id: "oa1", country: "JP" },
    });
    expect(mocks.mockFindFirst).toHaveBeenCalledWith({
      where: { id: "o1", tenantId: "t1" },
      include: expect.objectContaining({ items: true, address: true }),
    });
  });

  it("creates an order nesting items and address", async () => {
    mocks.mockCreate.mockResolvedValue(orderRow);

    await repo.create("t1", {
      orderNumber: "AN-1001",
      email: "buyer@example.com",
      subtotal: 2999,
      total: 3769,
      taxBreakdown: null,
      items: [{ productId: "p1", name: "Anime Figurine", price: 2999, quantity: 1 }],
      address: { line1: "1 Otaku St", city: "Tokyo", state: "Tokyo", postalCode: "100-0001", country: "JP" },
    });

    expect(mocks.mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: "t1",
          currency: "usd",
          taxBreakdown: Prisma.JsonNull,
          items: { create: [expect.objectContaining({ productId: "p1", quantity: 1 })] },
          address: { create: expect.objectContaining({ city: "Tokyo" }) },
        }),
      }),
    );
  });

  it("lists orders filtered by status and user with pagination", async () => {
    mocks.mockFindMany.mockResolvedValue([orderRow]);
    mocks.mockCount.mockResolvedValue(1);

    const result = await repo.list("t1", { status: "PENDING", userId: "u1", page: 1, pageSize: 20 });

    expect(result).toEqual({ items: [expect.objectContaining({ id: "o1" })], total: 1, page: 1, pageSize: 20 });
    expect(mocks.mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: "t1", status: "PENDING", userId: "u1" },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 20,
      }),
    );
  });

  it("throws NotFoundError when updating a missing order", async () => {
    mocks.mockUpdateMany.mockResolvedValue({ count: 0 });

    await expect(repo.update("t1", "o1", { status: "SHIPPED" })).rejects.toThrow(NotFoundError);
  });

  it("re-fetches and maps the order after a successful update", async () => {
    const shipped = { ...orderRow, status: "SHIPPED", items: [itemRow], address: addressRow };
    mocks.mockUpdateMany.mockResolvedValue({ count: 1 });
    mocks.mockFindFirst.mockResolvedValue(shipped);

    const order = await repo.update("t1", "o1", { status: "SHIPPED" });

    expect(order?.status).toBe("SHIPPED");
  });
});

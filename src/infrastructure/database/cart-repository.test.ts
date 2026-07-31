import { describe, expect, it, vi } from "vitest";
import { PrismaCartRepository } from "./cart-repository";
import { NotFoundError } from "@/shared/errors/platform-error";

const mocks = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockCreate: vi.fn(),
  mockCartItemFindFirst: vi.fn(),
  mockCartItemUpdate: vi.fn(),
  mockCartItemCreate: vi.fn(),
  mockCartItemDeleteMany: vi.fn(),
  mockDeleteMany: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    cart: {
      findFirst: mocks.mockFindFirst,
      create: mocks.mockCreate,
      deleteMany: mocks.mockDeleteMany,
    },
    cartItem: {
      findFirst: mocks.mockCartItemFindFirst,
      update: mocks.mockCartItemUpdate,
      create: mocks.mockCartItemCreate,
      deleteMany: mocks.mockCartItemDeleteMany,
    },
  },
  Prisma: {},
}));

const itemRow = {
  id: "ci1",
  cartId: "c1",
  productId: "p1",
  variantId: null,
  quantity: 2,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const cartRow = {
  id: "c1",
  tenantId: "t1",
  userId: "u1",
  sessionId: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("PrismaCartRepository", () => {
  const repo = new PrismaCartRepository();

  it("implements the CartRepository contract", () => {
    for (const method of ["findById", "findByUserId", "findBySessionId", "create", "upsertItem", "removeItem", "clear", "delete"]) {
      expect(typeof (repo as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("maps a cart with items to the domain type", async () => {
    mocks.mockFindFirst.mockResolvedValue({ ...cartRow, items: [itemRow] });

    const cart = await repo.findById("t1", "c1");

    expect(cart).toEqual({
      id: "c1",
      tenantId: "t1",
      userId: "u1",
      sessionId: null,
      createdAt: cartRow.createdAt,
      updatedAt: cartRow.updatedAt,
      items: [itemRow],
    });
  });

  it("increments an existing item quantity on upsert", async () => {
    mocks.mockFindFirst.mockResolvedValue({ ...cartRow, items: [] });
    mocks.mockCartItemFindFirst.mockResolvedValue(itemRow);
    mocks.mockCartItemUpdate.mockResolvedValue({ ...itemRow, quantity: 3 });

    const item = await repo.upsertItem("t1", "c1", { productId: "p1", quantity: 1 });

    expect(mocks.mockCartItemUpdate).toHaveBeenCalledWith({
      where: { id: "ci1" },
      data: { quantity: { increment: 1 } },
    });
    expect(item.quantity).toBe(3);
  });

  it("creates a new item when none exists on upsert", async () => {
    mocks.mockFindFirst.mockResolvedValue({ ...cartRow, items: [] });
    mocks.mockCartItemFindFirst.mockResolvedValue(null);
    mocks.mockCartItemCreate.mockResolvedValue(itemRow);

    const item = await repo.upsertItem("t1", "c1", { productId: "p1", quantity: 2 });

    expect(mocks.mockCartItemCreate).toHaveBeenCalledWith({
      data: { cartId: "c1", productId: "p1", variantId: null, quantity: 2 },
    });
    expect(item.id).toBe("ci1");
  });

  it("throws NotFoundError when upserting into a missing cart", async () => {
    mocks.mockFindFirst.mockResolvedValue(null);

    await expect(repo.upsertItem("t1", "c1", { productId: "p1", quantity: 1 })).rejects.toThrow(NotFoundError);
  });

  it("clears all items of a cart", async () => {
    mocks.mockFindFirst.mockResolvedValue({ ...cartRow, items: [itemRow] });
    mocks.mockCartItemDeleteMany.mockResolvedValue({ count: 1 });

    await repo.clear("t1", "c1");

    expect(mocks.mockCartItemDeleteMany).toHaveBeenCalledWith({ where: { cartId: "c1" } });
  });

  it("throws NotFoundError when deleting a missing cart", async () => {
    mocks.mockDeleteMany.mockResolvedValue({ count: 0 });

    await expect(repo.delete("t1", "c1")).rejects.toThrow(NotFoundError);
  });
});

import { describe, expect, it, vi } from "vitest";
import { PrismaCollectionRepository } from "./collection-repository";
import { NotFoundError } from "@/shared/errors/platform-error";

const mocks = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockDeleteMany: vi.fn(),
  mockUpdate: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    collection: {
      findFirst: mocks.mockFindFirst,
      findMany: mocks.mockFindMany,
      count: mocks.mockCount,
      create: mocks.mockCreate,
      updateMany: mocks.mockUpdateMany,
      deleteMany: mocks.mockDeleteMany,
      update: mocks.mockUpdate,
    },
  },
  Prisma: {},
}));

const ruleRow = {
  id: "r1",
  collectionId: "col1",
  field: "price",
  operator: "lt",
  value: 5000,
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

const collectionRow = {
  id: "col1",
  tenantId: "t1",
  name: "Best Sellers",
  slug: "best-sellers",
  description: null,
  image: null,
  isManual: true,
  isPublished: true,
  sortOrder: 1,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("PrismaCollectionRepository", () => {
  const repo = new PrismaCollectionRepository();

  it("implements the CollectionRepository contract", () => {
    for (const method of ["findById", "findBySlug", "list", "create", "update", "delete", "addProduct", "removeProduct"]) {
      expect(typeof (repo as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("maps a collection with rules and product ids to the domain type", async () => {
    mocks.mockFindFirst.mockResolvedValue({ ...collectionRow, rules: [ruleRow], products: [{ id: "p1" }, { id: "p2" }] });

    const collection = await repo.findById("t1", "col1");

    expect(collection).toMatchObject({
      id: "col1",
      name: "Best Sellers",
      rules: [{ id: "r1", field: "price", operator: "lt", value: 5000 }],
      productIds: ["p1", "p2"],
    });
    expect(mocks.mockFindFirst).toHaveBeenCalledWith({
      where: { id: "col1", tenantId: "t1" },
      include: expect.objectContaining({ rules: true, products: expect.any(Object) }),
    });
  });

  it("creates a collection with nested rules and connected products", async () => {
    mocks.mockCreate.mockResolvedValue(collectionRow);

    await repo.create("t1", {
      name: "Best Sellers",
      slug: "best-sellers",
      rules: [{ field: "price", operator: "lt", value: 5000 }],
      productIds: ["p1"],
    });

    expect(mocks.mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: "t1",
          isManual: true,
          rules: { create: [expect.objectContaining({ field: "price", operator: "lt", value: 5000 })] },
          products: { connect: [{ id: "p1" }] },
        }),
      }),
    );
  });

  it("lists collections filtered by published state", async () => {
    mocks.mockFindMany.mockResolvedValue([collectionRow]);
    mocks.mockCount.mockResolvedValue(1);

    const result = await repo.list("t1", { isPublished: true, page: 1, pageSize: 10 });

    expect(result).toEqual({ items: [expect.objectContaining({ id: "col1" })], total: 1, page: 1, pageSize: 10 });
    expect(mocks.mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tenantId: "t1", isPublished: true },
        orderBy: { sortOrder: "asc" },
        skip: 0,
        take: 10,
      }),
    );
  });

  it("throws NotFoundError when deleting a missing collection", async () => {
    mocks.mockDeleteMany.mockResolvedValue({ count: 0 });

    await expect(repo.delete("t1", "col1")).rejects.toThrow(NotFoundError);
  });

  it("connects a product when adding to a collection", async () => {
    mocks.mockFindFirst.mockResolvedValue({ ...collectionRow, rules: [], products: [] });
    mocks.mockUpdate.mockResolvedValue(collectionRow);

    await repo.addProduct("t1", "col1", "p1");

    expect(mocks.mockUpdate).toHaveBeenCalledWith({
      where: { id: "col1" },
      data: { products: { connect: { id: "p1" } } },
    });
  });

  it("throws NotFoundError when adding to a missing collection", async () => {
    mocks.mockFindFirst.mockResolvedValue(null);

    await expect(repo.addProduct("t1", "col1", "p1")).rejects.toThrow(NotFoundError);
  });
});

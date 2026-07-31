import { describe, expect, it, vi } from "vitest";
import { PrismaProductRepository } from "./product-repository";
import { NotFoundError } from "@/shared/errors/platform-error";
import { Prisma } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdateMany: vi.fn(),
  mockDeleteMany: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    product: {
      findFirst: mocks.mockFindFirst,
      findMany: mocks.mockFindMany,
      count: mocks.mockCount,
      create: mocks.mockCreate,
      updateMany: mocks.mockUpdateMany,
      deleteMany: mocks.mockDeleteMany,
    },
  },
  Prisma: {},
}));

const row = {
  id: "p1",
  tenantId: "t1",
  name: "Anime Figurine",
  slug: "anime-figurine",
  description: "Collectible",
  price: 2999,
  compareAtPrice: null,
  costPrice: null,
  stock: 10,
  sku: "FIG-1",
  brandId: null,
  typeId: null,
  taxCategoryId: null,
  weightKg: 0.5,
  dimensions: { w: 10, h: 20 },
  requiresShipping: true,
  categoryId: null,
  isPublished: true,
  isFeatured: false,
  tags: ["anime", "figure"],
  metadata: { source: "import" },
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-02T00:00:00Z"),
};

const variantRow = {
  id: "v1",
  productId: "p1",
  sku: "FIG-1-M",
  name: "Medium",
  barcode: null,
  price: 2999,
  compareAtPrice: null,
  costPrice: null,
  stock: 4,
  options: { size: "M" },
  isDefault: true,
  isActive: true,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const imageRow = {
  id: "img1",
  productId: "p1",
  url: "https://cdn.example.com/figurine.png",
  alt: "Figurine",
  order: 0,
};

const attributeValueRow = {
  id: "av1",
  productId: "p1",
  attributeId: "a1",
  value: "red",
};

const fullRow = { ...row, images: [imageRow], variants: [variantRow], values: [attributeValueRow] };

describe("PrismaProductRepository", () => {
  const repo = new PrismaProductRepository();

  it("implements the ProductRepository contract", () => {
    for (const method of ["findById", "findBySlug", "list", "create", "update", "delete", "adjustStock"]) {
      expect(typeof (repo as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("maps a product with nested relations to the domain type", async () => {
    mocks.mockFindFirst.mockResolvedValue(fullRow);

    const product = await repo.findById("t1", "p1");

    expect(product).toMatchObject({
      id: "p1",
      tenantId: "t1",
      name: "Anime Figurine",
      price: 2999,
      tags: ["anime", "figure"],
      metadata: { source: "import" },
    });
    expect(product?.images).toEqual([{ id: "img1", url: imageRow.url, alt: imageRow.alt, order: 0 }]);
    expect(product?.variants).toHaveLength(1);
    expect(product?.variants?.[0]).toMatchObject({ id: "v1", options: { size: "M" } });
    expect(product?.attributeValues).toEqual([{ id: "av1", productId: "p1", attributeId: "a1", value: "red" }]);
    expect(mocks.mockFindFirst).toHaveBeenCalledWith({
      where: { id: "p1", tenantId: "t1" },
      include: expect.objectContaining({ images: expect.any(Object) }),
    });
  });

  it("scopes lookups to the default tenant when tenantId is null", async () => {
    mocks.mockFindFirst.mockResolvedValue(null);

    await repo.findBySlug(null, "figurine");

    expect(mocks.mockFindFirst).toHaveBeenCalledWith({
      where: { slug: "figurine" },
      include: expect.any(Object),
    });
  });

  it("lists products with pagination and filters", async () => {
    mocks.mockFindMany.mockResolvedValue([row]);
    mocks.mockCount.mockResolvedValue(1);

    const result = await repo.list({
      tenantId: "t1",
      search: "anime",
      minPrice: 1000,
      maxPrice: 5000,
      page: 2,
      pageSize: 10,
    });

    expect(result).toEqual({ items: [expect.objectContaining({ id: "p1" })], total: 1, page: 2, pageSize: 10 });
    expect(mocks.mockFindMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        tenantId: "t1",
        name: { contains: "anime", mode: "insensitive" },
        price: { gte: 1000, lte: 5000 },
      }),
      orderBy: { createdAt: "desc" },
      skip: 10,
      take: 10,
    });
  });

  it("creates a product serializing JSON fields", async () => {
    mocks.mockCreate.mockResolvedValue(row);

    await repo.create("t1", {
      name: "Anime Figurine",
      slug: "anime-figurine",
      description: "Collectible",
      sku: "FIG-1",
      price: 2999,
      dimensions: { w: 10 },
      metadata: null,
    });

    expect(mocks.mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenantId: "t1",
        price: 2999,
        dimensions: { w: 10 },
        metadata: Prisma.JsonNull,
      }),
    });
  });

  it("throws NotFoundError when updating a missing product", async () => {
    mocks.mockUpdateMany.mockResolvedValue({ count: 0 });

    await expect(repo.update("t1", "p1", { price: 1999 })).rejects.toThrow(NotFoundError);
  });

  it("adjusts stock via updateMany increment", async () => {
    mocks.mockUpdateMany.mockResolvedValue({ count: 1 });

    await repo.adjustStock("t1", "p1", -2);

    expect(mocks.mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "p1", tenantId: "t1" },
      data: { stock: { increment: -2 } },
    });
  });
});

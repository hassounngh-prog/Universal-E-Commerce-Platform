import { describe, expect, it, vi } from "vitest";
import { PrismaReviewRepository } from "./review-repository";
import { NotFoundError } from "@/shared/errors/platform-error";

const mocks = vi.hoisted(() => ({
  mockFindFirst: vi.fn(),
  mockFindMany: vi.fn(),
  mockCount: vi.fn(),
  mockAggregate: vi.fn(),
  mockCreate: vi.fn(),
  mockUpdateMany: vi.fn(),
}));

vi.mock("@/shared/lib/prisma", () => ({
  prisma: {
    review: {
      findFirst: mocks.mockFindFirst,
      findMany: mocks.mockFindMany,
      count: mocks.mockCount,
      aggregate: mocks.mockAggregate,
      create: mocks.mockCreate,
      updateMany: mocks.mockUpdateMany,
    },
  },
  Prisma: {},
}));

const mediaRow = {
  id: "m1",
  reviewId: "rev1",
  url: "https://cdn.example.com/review.png",
  type: "IMAGE",
  sortOrder: 0,
};

const reviewRow = {
  id: "rev1",
  tenantId: "t1",
  productId: "p1",
  userId: "u1",
  orderId: "o1",
  rating: 5,
  title: "Great",
  body: "Loved it",
  isVerified: true,
  status: "APPROVED",
  helpfulCount: 3,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("PrismaReviewRepository", () => {
  const repo = new PrismaReviewRepository();

  it("implements the ReviewRepository contract", () => {
    for (const method of ["findById", "list", "create", "update", "setStatus"]) {
      expect(typeof (repo as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("maps a review with media to the domain type", async () => {
    mocks.mockFindFirst.mockResolvedValue({ ...reviewRow, media: [mediaRow] });

    const review = await repo.findById("t1", "rev1");

    expect(review).toMatchObject({
      id: "rev1",
      rating: 5,
      status: "APPROVED",
      isVerified: true,
      media: [{ id: "m1", type: "IMAGE", sortOrder: 0 }],
    });
  });

  it("creates a review with nested media", async () => {
    mocks.mockCreate.mockResolvedValue(reviewRow);

    await repo.create("t1", {
      productId: "p1",
      userId: "u1",
      rating: 5,
      media: [{ url: "https://cdn.example.com/review.png", type: "IMAGE" }],
    });

    expect(mocks.mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: "t1",
          rating: 5,
          media: { create: [expect.objectContaining({ url: mediaRow.url, type: "IMAGE", sortOrder: 0 })] },
        }),
      }),
    );
  });

  it("lists reviews with pagination and average rating", async () => {
    mocks.mockFindMany.mockResolvedValue([reviewRow]);
    mocks.mockCount.mockResolvedValue(1);
    mocks.mockAggregate.mockResolvedValue({ _avg: { rating: 5 } });

    const result = await repo.list("t1", { productId: "p1", status: "APPROVED", page: 1, pageSize: 10 });

    expect(result).toEqual({
      items: [expect.objectContaining({ id: "rev1" })],
      total: 1,
      page: 1,
      pageSize: 10,
      averageRating: 5,
    });
    expect(mocks.mockAggregate).toHaveBeenCalledWith({
      where: { tenantId: "t1", productId: "p1", status: "APPROVED" },
      _avg: { rating: true },
    });
  });

  it("throws NotFoundError when updating a missing review", async () => {
    mocks.mockUpdateMany.mockResolvedValue({ count: 0 });

    await expect(repo.update("t1", "rev1", { rating: 4 })).rejects.toThrow(NotFoundError);
  });

  it("sets the review status via updateMany", async () => {
    mocks.mockUpdateMany.mockResolvedValue({ count: 1 });
    mocks.mockFindFirst.mockResolvedValue({ ...reviewRow, status: "REJECTED", media: [] });

    const review = await repo.setStatus("t1", "rev1", "REJECTED");

    expect(mocks.mockUpdateMany).toHaveBeenCalledWith({
      where: { id: "rev1", tenantId: "t1" },
      data: { status: "REJECTED" },
    });
    expect(review.status).toBe("REJECTED");
  });
});

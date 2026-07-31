import { Prisma, prisma } from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/errors/platform-error";
import type { ReviewRepository } from "@/core/review/review-repository.interface";
import type {
  CreateReviewInput,
  Review,
  ReviewListFilter,
  ReviewListResult,
  ReviewMedia,
  ReviewStatus,
  UpdateReviewInput,
} from "@/core/review/types";
import type {
  Review as ReviewRow,
  ReviewMedia as ReviewMediaRow,
} from "@/generated/prisma/client";

interface ReviewWithRelations extends ReviewRow {
  media?: ReviewMediaRow[];
}

const REVIEW_INCLUDE = {
  media: { orderBy: { sortOrder: "asc" } },
} as const;

function tenantScope(tenantId: string | null): { tenantId: string } | Record<string, never> {
  return tenantId ? { tenantId } : {};
}

function toDomain(row: ReviewWithRelations): Review {
  return {
    id: row.id,
    tenantId: row.tenantId,
    productId: row.productId,
    userId: row.userId,
    orderId: row.orderId,
    rating: row.rating,
    title: row.title,
    body: row.body,
    isVerified: row.isVerified,
    status: row.status as ReviewStatus,
    helpfulCount: row.helpfulCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    media: (row.media ?? []).map(toMediaDomain),
  };
}

function toMediaDomain(row: ReviewMediaRow): ReviewMedia {
  return {
    id: row.id,
    reviewId: row.reviewId,
    url: row.url,
    type: row.type as ReviewMedia["type"],
    sortOrder: row.sortOrder,
  };
}

function toPrismaCreate(
  tenantId: string | null,
  input: CreateReviewInput,
): Prisma.ReviewUncheckedCreateInput {
  return {
    tenantId: tenantId ?? null,
    productId: input.productId,
    userId: input.userId ?? null,
    orderId: input.orderId ?? null,
    rating: input.rating,
    title: input.title,
    body: input.body,
    isVerified: input.isVerified ?? false,
    status: input.status as ReviewRow["status"] | undefined,
    media: input.media?.length
      ? {
          create: input.media.map((media) => ({
            url: media.url,
            type: media.type as ReviewMediaRow["type"],
            sortOrder: media.sortOrder ?? 0,
          })),
        }
      : undefined,
  };
}

function toPrismaUpdate(input: UpdateReviewInput): Prisma.ReviewUpdateManyMutationInput {
  return {
    rating: input.rating,
    title: input.title,
    body: input.body,
    isVerified: input.isVerified,
    helpfulCount: input.helpfulCount,
  };
}

function toFilter(tenantId: string | null, filter?: ReviewListFilter): Prisma.ReviewWhereInput {
  return {
    ...tenantScope(tenantId),
    ...(filter?.productId ? { productId: filter.productId } : {}),
    ...(filter?.userId ? { userId: filter.userId } : {}),
    ...(filter?.status ? { status: filter.status as ReviewRow["status"] } : {}),
  };
}

export class PrismaReviewRepository implements ReviewRepository {
  async findById(tenantId: string | null, id: string): Promise<Review | null> {
    const row = (await prisma.review.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: REVIEW_INCLUDE,
    })) as ReviewWithRelations | null;
    return row ? toDomain(row) : null;
  }

  async list(tenantId: string | null, filter?: ReviewListFilter): Promise<ReviewListResult> {
    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    const where = toFilter(tenantId, filter);
    const [rows, total, aggregate] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: REVIEW_INCLUDE,
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({ where, _avg: { rating: true } }),
    ]);
    return {
      items: rows.map((row) => toDomain(row as ReviewWithRelations)),
      total,
      page,
      pageSize,
      averageRating: aggregate._avg.rating ?? null,
    };
  }

  async create(tenantId: string | null, input: CreateReviewInput): Promise<Review> {
    const row = (await prisma.review.create({
      data: toPrismaCreate(tenantId, input),
      include: REVIEW_INCLUDE,
    })) as ReviewWithRelations;
    return toDomain(row);
  }

  async update(tenantId: string | null, id: string, input: UpdateReviewInput): Promise<Review> {
    const result = await prisma.review.updateMany({
      where: { id, ...tenantScope(tenantId) },
      data: toPrismaUpdate(input),
    });
    if (result.count === 0) {
      throw new NotFoundError(`Review ${id} not found`);
    }
    const row = (await prisma.review.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: REVIEW_INCLUDE,
    })) as ReviewWithRelations | null;
    if (!row) {
      throw new NotFoundError(`Review ${id} not found`);
    }
    return toDomain(row);
  }

  async setStatus(
    tenantId: string | null,
    id: string,
    status: ReviewStatus,
  ): Promise<Review> {
    const result = await prisma.review.updateMany({
      where: { id, ...tenantScope(tenantId) },
      data: { status: status as ReviewRow["status"] },
    });
    if (result.count === 0) {
      throw new NotFoundError(`Review ${id} not found`);
    }
    const row = (await prisma.review.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: REVIEW_INCLUDE,
    })) as ReviewWithRelations | null;
    if (!row) {
      throw new NotFoundError(`Review ${id} not found`);
    }
    return toDomain(row);
  }
}

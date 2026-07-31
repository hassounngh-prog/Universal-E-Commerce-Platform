import type {
  CreateReviewInput,
  Review,
  ReviewListFilter,
  ReviewListResult,
  ReviewStatus,
  UpdateReviewInput,
} from "./types";

export interface ReviewRepository {
  findById(tenantId: string | null, id: string): Promise<Review | null>;
  list(tenantId: string | null, filter?: ReviewListFilter): Promise<ReviewListResult>;
  create(tenantId: string | null, input: CreateReviewInput): Promise<Review>;
  update(tenantId: string | null, id: string, input: UpdateReviewInput): Promise<Review>;
  setStatus(tenantId: string | null, id: string, status: ReviewStatus): Promise<Review>;
}

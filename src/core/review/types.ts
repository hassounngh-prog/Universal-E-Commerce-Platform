export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReviewMedia {
  id: string;
  reviewId: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  sortOrder: number;
}

export interface Review {
  id: string;
  tenantId: string | null;
  productId: string;
  userId: string | null;
  orderId: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  isVerified: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  createdAt: Date;
  updatedAt: Date;
  media: ReviewMedia[];
}

export interface CreateReviewInput {
  productId: string;
  userId?: string | null;
  orderId?: string | null;
  rating: number;
  title?: string | null;
  body?: string | null;
  isVerified?: boolean;
  status?: ReviewStatus;
  media?: { url: string; type?: "IMAGE" | "VIDEO"; sortOrder?: number }[];
}

export interface UpdateReviewInput {
  rating?: number;
  title?: string | null;
  body?: string | null;
  isVerified?: boolean;
  helpfulCount?: number;
}

export interface ReviewListFilter {
  productId?: string;
  userId?: string;
  status?: ReviewStatus;
  page?: number;
  pageSize?: number;
}

export interface ReviewListResult {
  items: Review[];
  total: number;
  page: number;
  pageSize: number;
  averageRating: number | null;
}

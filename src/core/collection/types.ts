export interface CollectionRule {
  id: string;
  collectionId: string;
  field: string;
  operator: string;
  value: unknown;
  createdAt: Date;
}

export interface Collection {
  id: string;
  tenantId: string | null;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  isManual: boolean;
  isPublished: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  rules: CollectionRule[];
  productIds: string[];
}

export interface CreateCollectionRuleInput {
  field: string;
  operator: string;
  value: unknown;
}

export interface CreateCollectionInput {
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  isManual?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
  rules?: CreateCollectionRuleInput[];
  productIds?: string[];
}

export interface UpdateCollectionInput {
  name?: string;
  slug?: string;
  description?: string | null;
  image?: string | null;
  isManual?: boolean;
  isPublished?: boolean;
  sortOrder?: number;
}

export interface CollectionListFilter {
  isPublished?: boolean;
  page?: number;
  pageSize?: number;
}

export interface CollectionListResult {
  items: Collection[];
  total: number;
  page: number;
  pageSize: number;
}

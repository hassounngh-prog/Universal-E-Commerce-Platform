export type TenantStatus = "ACTIVE" | "TRIAL" | "SUSPENDED";

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  locale: string;
  currency: string;
  countryCode: string;
  status: TenantStatus;
  config: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTenantInput {
  name: string;
  slug: string;
  domain?: string | null;
  locale?: string;
  currency?: string;
  countryCode?: string;
  status?: TenantStatus;
  config?: Record<string, unknown> | null;
}

export interface UpdateTenantInput {
  name?: string;
  slug?: string;
  domain?: string | null;
  locale?: string;
  currency?: string;
  countryCode?: string;
  status?: TenantStatus;
  config?: Record<string, unknown> | null;
}

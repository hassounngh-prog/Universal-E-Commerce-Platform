import type { CreateTenantInput, Tenant, UpdateTenantInput } from "./types";

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findBySlug(slug: string): Promise<Tenant | null>;
  findByDomain(domain: string): Promise<Tenant | null>;
  list(): Promise<Tenant[]>;
  create(input: CreateTenantInput): Promise<Tenant>;
  update(id: string, input: UpdateTenantInput): Promise<Tenant>;
}

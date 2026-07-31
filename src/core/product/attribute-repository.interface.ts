import type { Attribute } from "./attribute-types";

export interface AttributeRepository {
  findById(tenantId: string | null, id: string): Promise<Attribute | null>;
  findBySlug(tenantId: string | null, slug: string): Promise<Attribute | null>;
}

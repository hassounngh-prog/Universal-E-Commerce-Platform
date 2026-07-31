export type AttributeType =
  | "TEXT"
  | "NUMBER"
  | "BOOLEAN"
  | "DATE"
  | "SELECT"
  | "MULTISELECT"
  | "COLOR";

export interface Attribute {
  id: string;
  tenantId: string | null;
  name: string;
  slug: string;
  type: AttributeType;
  unit: string | null;
  required: boolean;
  filterable: boolean;
  sortable: boolean;
  group: string | null;
  options: unknown;
  isGlobal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

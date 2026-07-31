import { NotFoundError, ValidationError } from "@/shared/errors/platform-error";
import type { AttributeRepository } from "./attribute-repository.interface";
import type { Attribute } from "./attribute-types";
import type { ProductRepository } from "./product-repository.interface";
import type { ProductService } from "./product-service.interface";
import type {
  CreateProductInput,
  Product,
  ProductAttributeValueInput,
  ProductListFilter,
  ProductListResult,
  UpdateProductInput,
} from "./types";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR_PATTERN = /^#[0-9a-fA-F]{3,8}$/;

function isValidMoney(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value >= 0;
}

function normalizeDate(value: unknown): string | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === "string") {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? null : new Date(timestamp).toISOString();
  }
  return null;
}

function optionValues(options: unknown): string[] {
  if (!Array.isArray(options)) return [];
  return options.flatMap((option) => {
    if (typeof option === "string") return [option];
    if (
      typeof option === "object" &&
      option !== null &&
      typeof (option as { value?: unknown }).value === "string"
    ) {
      return [(option as { value: string }).value];
    }
    return [];
  });
}

function validateAttributeValue(attribute: Attribute, value: unknown): unknown {
  switch (attribute.type) {
    case "TEXT":
      if (typeof value !== "string") {
        throw new ValidationError(`Attribute ${attribute.slug} expects a string value`);
      }
      return value;
    case "NUMBER":
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new ValidationError(`Attribute ${attribute.slug} expects a number value`);
      }
      return value;
    case "BOOLEAN":
      if (typeof value !== "boolean") {
        throw new ValidationError(`Attribute ${attribute.slug} expects a boolean value`);
      }
      return value;
    case "DATE": {
      const normalized = normalizeDate(value);
      if (normalized === null) {
        throw new ValidationError(`Attribute ${attribute.slug} expects a valid date value`);
      }
      return normalized;
    }
    case "COLOR":
      if (typeof value !== "string" || !COLOR_PATTERN.test(value)) {
        throw new ValidationError(`Attribute ${attribute.slug} expects a hex color value`);
      }
      return value;
    case "SELECT": {
      if (typeof value !== "string") {
        throw new ValidationError(`Attribute ${attribute.slug} expects a string value`);
      }
      const options = optionValues(attribute.options);
      if (options.length > 0 && !options.includes(value)) {
        throw new ValidationError(`Attribute ${attribute.slug} does not accept value "${value}"`);
      }
      return value;
    }
    case "MULTISELECT": {
      if (!Array.isArray(value) || value.some((entry) => typeof entry !== "string")) {
        throw new ValidationError(`Attribute ${attribute.slug} expects an array of strings`);
      }
      const options = optionValues(attribute.options);
      if (options.length > 0) {
        const invalid = value.find((entry) => !options.includes(entry));
        if (invalid !== undefined) {
          throw new ValidationError(
            `Attribute ${attribute.slug} does not accept value "${invalid}"`,
          );
        }
      }
      return value;
    }
    default:
      return value;
  }
}

export class DefaultProductService implements ProductService {
  constructor(
    private readonly products: ProductRepository,
    private readonly attributes: AttributeRepository,
  ) {}

  async getById(tenantId: string | null, id: string): Promise<Product> {
    const product = await this.products.findById(tenantId, id);
    if (!product) {
      throw new NotFoundError(`Product ${id} not found`);
    }
    return product;
  }

  async getBySlug(tenantId: string | null, slug: string): Promise<Product> {
    const product = await this.products.findBySlug(tenantId, slug);
    if (!product) {
      throw new NotFoundError(`Product ${slug} not found`);
    }
    return product;
  }

  async list(tenantId: string | null, filter: ProductListFilter): Promise<ProductListResult> {
    return this.products.list({ ...filter, tenantId });
  }

  async create(tenantId: string | null, input: CreateProductInput): Promise<Product> {
    this.validateCreateInput(input);
    const attributeValues = await this.validateAttributeValues(tenantId, input.attributeValues ?? []);
    const createInput =
      attributeValues.length > 0 ? { ...input, attributeValues } : input;
    return this.products.create(tenantId, createInput);
  }

  async update(tenantId: string | null, id: string, input: UpdateProductInput): Promise<Product> {
    this.validateUpdateInput(input);
    return this.products.update(tenantId, id, input);
  }

  async delete(tenantId: string | null, id: string): Promise<void> {
    await this.products.delete(tenantId, id);
  }

  async adjustStock(tenantId: string | null, id: string, delta: number): Promise<void> {
    if (!Number.isFinite(delta) || !Number.isInteger(delta)) {
      throw new ValidationError("Stock adjustment must be an integer");
    }
    await this.products.adjustStock(tenantId, id, delta);
  }

  async setAttributeValues(
    tenantId: string | null,
    id: string,
    values: ProductAttributeValueInput[],
  ): Promise<Product> {
    const normalized = await this.validateAttributeValues(tenantId, values);
    return this.products.setAttributeValues(tenantId, id, normalized);
  }

  private validateCreateInput(input: CreateProductInput): void {
    if (typeof input.name !== "string" || input.name.trim().length === 0) {
      throw new ValidationError("Product name is required");
    }
    if (typeof input.description !== "string" || input.description.trim().length === 0) {
      throw new ValidationError("Product description is required");
    }
    this.validateSlug(input.slug);
    if (typeof input.sku !== "string" || input.sku.trim().length === 0) {
      throw new ValidationError("Product sku is required");
    }
    if (!isValidMoney(input.price)) {
      throw new ValidationError("Product price must be a non-negative integer");
    }
    this.validateOptionalMoney(input.compareAtPrice, "compareAtPrice");
    this.validateOptionalMoney(input.costPrice, "costPrice");
    this.validateStock(input.stock);
    this.validateTags(input.tags);
  }

  private validateUpdateInput(input: UpdateProductInput): void {
    if (input.name !== undefined && (typeof input.name !== "string" || input.name.trim().length === 0)) {
      throw new ValidationError("Product name must be a non-empty string");
    }
    if (input.slug !== undefined) {
      this.validateSlug(input.slug);
    }
    if (input.sku !== undefined && (typeof input.sku !== "string" || input.sku.trim().length === 0)) {
      throw new ValidationError("Product sku must be a non-empty string");
    }
    if (input.price !== undefined && !isValidMoney(input.price)) {
      throw new ValidationError("Product price must be a non-negative integer");
    }
    this.validateOptionalMoney(input.compareAtPrice, "compareAtPrice");
    this.validateOptionalMoney(input.costPrice, "costPrice");
    this.validateStock(input.stock);
    this.validateTags(input.tags);
  }

  private validateSlug(slug: string): void {
    if (!SLUG_PATTERN.test(slug)) {
      throw new ValidationError(`Slug must be lowercase alphanumeric with hyphens: ${slug}`);
    }
  }

  private validateOptionalMoney(value: number | null | undefined, field: string): void {
    if (value !== null && value !== undefined && !isValidMoney(value)) {
      throw new ValidationError(`Product ${field} must be a non-negative integer`);
    }
  }

  private validateStock(value: number | undefined): void {
    if (value !== undefined && !isValidMoney(value)) {
      throw new ValidationError("Product stock must be a non-negative integer");
    }
  }

  private validateTags(value: string[] | undefined): void {
    if (value !== undefined && (!Array.isArray(value) || value.some((tag) => typeof tag !== "string"))) {
      throw new ValidationError("Product tags must be an array of strings");
    }
  }

  private async validateAttributeValues(
    tenantId: string | null,
    values: ProductAttributeValueInput[],
  ): Promise<ProductAttributeValueInput[]> {
    const seen = new Set<string>();
    const normalized: ProductAttributeValueInput[] = [];
    for (const entry of values) {
      if (seen.has(entry.attributeId)) {
        throw new ValidationError(`Duplicate attribute value for attribute ${entry.attributeId}`);
      }
      seen.add(entry.attributeId);
      const attribute = await this.attributes.findById(tenantId, entry.attributeId);
      if (!attribute) {
        throw new ValidationError(`Attribute ${entry.attributeId} not found`);
      }
      normalized.push({
        attributeId: entry.attributeId,
        value: validateAttributeValue(attribute, entry.value),
      });
    }
    return normalized;
  }
}

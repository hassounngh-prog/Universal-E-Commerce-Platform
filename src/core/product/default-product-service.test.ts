import { describe, expect, it, vi } from "vitest";
import { DefaultProductService } from "./default-product-service";
import { NotFoundError, ValidationError } from "@/shared/errors/platform-error";
import type { AttributeRepository } from "./attribute-repository.interface";
import type { ProductRepository } from "./product-repository.interface";

function createRepositories() {
  const products = {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    adjustStock: vi.fn(),
    setAttributeValues: vi.fn(),
  };
  const attributes = {
    findById: vi.fn(),
    findBySlug: vi.fn(),
  };
  return {
    products: products as unknown as ProductRepository,
    attributes: attributes as unknown as AttributeRepository,
    productsMock: products,
    attributesMock: attributes,
  };
}

const baseProduct = {
  id: "p1",
  tenantId: "t1",
  name: "Anime Figurine",
  slug: "anime-figurine",
  description: "Collectible",
  price: 2999,
  compareAtPrice: null,
  costPrice: null,
  stock: 10,
  sku: "FIG-1",
  brandId: null,
  typeId: null,
  taxCategoryId: null,
  weightKg: null,
  dimensions: null,
  requiresShipping: true,
  categoryId: null,
  isPublished: false,
  isFeatured: false,
  tags: [],
  metadata: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
  images: [],
  variants: [],
  attributeValues: [],
};

const textAttribute = {
  id: "a1",
  tenantId: "t1",
  name: "Material",
  slug: "material",
  type: "TEXT",
  unit: null,
  required: false,
  filterable: true,
  sortable: false,
  group: null,
  options: null,
  isGlobal: false,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const selectAttribute = {
  ...textAttribute,
  id: "a2",
  name: "Color",
  slug: "color",
  type: "SELECT",
  options: [{ value: "red" }, { value: "blue" }],
};

const dateAttribute = {
  ...textAttribute,
  id: "a3",
  name: "Release Date",
  slug: "release-date",
  type: "DATE",
};

describe("DefaultProductService", () => {
  it("returns a product by id", async () => {
    const { products, productsMock, attributes } = createRepositories();
    productsMock.findById.mockResolvedValue(baseProduct);
    const service = new DefaultProductService(products, attributes);

    await expect(service.getById("t1", "p1")).resolves.toEqual(baseProduct);
  });

  it("throws NotFoundError when the product is missing", async () => {
    const { products, productsMock, attributes } = createRepositories();
    productsMock.findById.mockResolvedValue(null);
    const service = new DefaultProductService(products, attributes);

    await expect(service.getById("t1", "missing")).rejects.toThrow(NotFoundError);
  });

  it("returns a product by slug", async () => {
    const { products, productsMock, attributes } = createRepositories();
    productsMock.findBySlug.mockResolvedValue(baseProduct);
    const service = new DefaultProductService(products, attributes);

    await expect(service.getBySlug("t1", "anime-figurine")).resolves.toEqual(baseProduct);
  });

  it("lists products with the tenant override", async () => {
    const { products, productsMock, attributes } = createRepositories();
    productsMock.list.mockResolvedValue({ items: [baseProduct], total: 1, page: 1, pageSize: 20 });
    const service = new DefaultProductService(products, attributes);

    const result = await service.list("t1", { categoryId: "cat1" });

    expect(productsMock.list).toHaveBeenCalledWith({ categoryId: "cat1", tenantId: "t1" });
    expect(result.items).toHaveLength(1);
  });

  it("creates a valid product", async () => {
    const { products, productsMock, attributes } = createRepositories();
    productsMock.create.mockResolvedValue(baseProduct);
    const service = new DefaultProductService(products, attributes);

    const result = await service.create("t1", {
      name: "Anime Figurine",
      slug: "anime-figurine",
      description: "Collectible",
      sku: "FIG-1",
      price: 2999,
    });

    expect(productsMock.create).toHaveBeenCalledWith("t1", {
      name: "Anime Figurine",
      slug: "anime-figurine",
      description: "Collectible",
      sku: "FIG-1",
      price: 2999,
    });
    expect(result).toEqual(baseProduct);
  });

  it("rejects an invalid slug on create", async () => {
    const { products, productsMock, attributes } = createRepositories();
    const service = new DefaultProductService(products, attributes);

    await expect(
      service.create("t1", {
        name: "Anime Figurine",
        slug: "Bad Slug",
        description: "Collectible",
        sku: "FIG-1",
        price: 2999,
      }),
    ).rejects.toThrow(ValidationError);
    expect(productsMock.create).not.toHaveBeenCalled();
  });

  it("rejects a negative price on create", async () => {
    const { products, productsMock, attributes } = createRepositories();
    const service = new DefaultProductService(products, attributes);

    await expect(
      service.create("t1", {
        name: "Anime Figurine",
        slug: "anime-figurine",
        description: "Collectible",
        sku: "FIG-1",
        price: -100,
      }),
    ).rejects.toThrow(ValidationError);
    expect(productsMock.create).not.toHaveBeenCalled();
  });

  it("validates attribute values against their definitions on create", async () => {
    const { products, productsMock, attributes, attributesMock } = createRepositories();
    attributesMock.findById.mockResolvedValue(textAttribute);
    const service = new DefaultProductService(products, attributes);

    await expect(
      service.create("t1", {
        name: "Anime Figurine",
        slug: "anime-figurine",
        description: "Collectible",
        sku: "FIG-1",
        price: 2999,
        attributeValues: [{ attributeId: "a1", value: 42 }],
      }),
    ).rejects.toThrow(ValidationError);
    expect(productsMock.create).not.toHaveBeenCalled();
  });

  it("rejects a select value that is not in the attribute options", async () => {
    const { products, productsMock, attributes, attributesMock } = createRepositories();
    attributesMock.findById.mockResolvedValue(selectAttribute);
    const service = new DefaultProductService(products, attributes);

    await expect(
      service.create("t1", {
        name: "Anime Figurine",
        slug: "anime-figurine",
        description: "Collectible",
        sku: "FIG-1",
        price: 2999,
        attributeValues: [{ attributeId: "a2", value: "green" }],
      }),
    ).rejects.toThrow(ValidationError);
    expect(productsMock.create).not.toHaveBeenCalled();
  });

  it("rejects attribute values for an unknown attribute", async () => {
    const { products, productsMock, attributes, attributesMock } = createRepositories();
    attributesMock.findById.mockResolvedValue(null);
    const service = new DefaultProductService(products, attributes);

    await expect(
      service.create("t1", {
        name: "Anime Figurine",
        slug: "anime-figurine",
        description: "Collectible",
        sku: "FIG-1",
        price: 2999,
        attributeValues: [{ attributeId: "missing", value: "x" }],
      }),
    ).rejects.toThrow(ValidationError);
    expect(productsMock.create).not.toHaveBeenCalled();
  });

  it("normalizes date attribute values to ISO strings on create", async () => {
    const { products, productsMock, attributes, attributesMock } = createRepositories();
    attributesMock.findById.mockResolvedValue(dateAttribute);
    productsMock.create.mockResolvedValue(baseProduct);
    const service = new DefaultProductService(products, attributes);

    await service.create("t1", {
      name: "Anime Figurine",
      slug: "anime-figurine",
      description: "Collectible",
      sku: "FIG-1",
      price: 2999,
      attributeValues: [{ attributeId: "a3", value: "2026-05-01" }],
    });

    expect(productsMock.create).toHaveBeenCalledWith(
      "t1",
      expect.objectContaining({
        attributeValues: [{ attributeId: "a3", value: "2026-05-01T00:00:00.000Z" }],
      }),
    );
  });

  it("updates a product after validating the input", async () => {
    const { products, productsMock, attributes } = createRepositories();
    productsMock.update.mockResolvedValue(baseProduct);
    const service = new DefaultProductService(products, attributes);

    await service.update("t1", "p1", { price: 1999 });

    expect(productsMock.update).toHaveBeenCalledWith("t1", "p1", { price: 1999 });
  });

  it("rejects a fractional price on update", async () => {
    const { products, productsMock, attributes } = createRepositories();
    const service = new DefaultProductService(products, attributes);

    await expect(service.update("t1", "p1", { price: 19.99 })).rejects.toThrow(ValidationError);
    expect(productsMock.update).not.toHaveBeenCalled();
  });

  it("deletes a product", async () => {
    const { products, productsMock, attributes } = createRepositories();
    productsMock.delete.mockResolvedValue(undefined);
    const service = new DefaultProductService(products, attributes);

    await service.delete("t1", "p1");

    expect(productsMock.delete).toHaveBeenCalledWith("t1", "p1");
  });

  it("rejects a non-integer stock adjustment", async () => {
    const { products, productsMock, attributes } = createRepositories();
    const service = new DefaultProductService(products, attributes);

    await expect(service.adjustStock("t1", "p1", 1.5)).rejects.toThrow(ValidationError);
    expect(productsMock.adjustStock).not.toHaveBeenCalled();
  });

  it("adjusts stock with an integer delta", async () => {
    const { products, productsMock, attributes } = createRepositories();
    productsMock.adjustStock.mockResolvedValue(undefined);
    const service = new DefaultProductService(products, attributes);

    await service.adjustStock("t1", "p1", -2);

    expect(productsMock.adjustStock).toHaveBeenCalledWith("t1", "p1", -2);
  });

  it("sets attribute values with normalized inputs", async () => {
    const { products, productsMock, attributes, attributesMock } = createRepositories();
    attributesMock.findById.mockResolvedValue(textAttribute);
    productsMock.setAttributeValues.mockResolvedValue(baseProduct);
    const service = new DefaultProductService(products, attributes);

    await service.setAttributeValues("t1", "p1", [{ attributeId: "a1", value: "cotton" }]);

    expect(productsMock.setAttributeValues).toHaveBeenCalledWith("t1", "p1", [
      { attributeId: "a1", value: "cotton" },
    ]);
  });

  it("rejects duplicate attribute values", async () => {
    const { products, productsMock, attributes, attributesMock } = createRepositories();
    attributesMock.findById.mockResolvedValue(textAttribute);
    const service = new DefaultProductService(products, attributes);

    await expect(
      service.setAttributeValues("t1", "p1", [
        { attributeId: "a1", value: "cotton" },
        { attributeId: "a1", value: "wool" },
      ]),
    ).rejects.toThrow(ValidationError);
    expect(productsMock.setAttributeValues).not.toHaveBeenCalled();
  });
});

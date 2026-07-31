import { describe, expect, it, vi } from "vitest";
import { DefaultCartService } from "./default-cart-service";
import { NotFoundError, ValidationError } from "@/shared/errors/platform-error";
import type { Cart } from "./types";
import type { CartRepository } from "./cart-repository.interface";
import type { PricingEngine } from "@/core/pricing/pricing-engine.interface";
import type { ProductRepository } from "@/core/product/product-repository.interface";

function createDependencies() {
  const carts = {
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findBySessionId: vi.fn(),
    create: vi.fn(),
    upsertItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    delete: vi.fn(),
  };
  const products = {
    findById: vi.fn(),
  };
  const pricing = {
    calculatePrice: vi.fn(),
  };
  return {
    carts: carts as unknown as CartRepository,
    products: products as unknown as ProductRepository,
    pricing: pricing as unknown as PricingEngine,
    cartsMock: carts,
    productsMock: products,
    pricingMock: pricing,
  };
}

const createdAt = new Date("2026-01-01T00:00:00Z");

function item(
  id: string,
  productId: string,
  variantId: string | null,
  quantity: number,
): Cart["items"][number] {
  return {
    id,
    cartId: "cart1",
    productId,
    variantId,
    quantity,
    createdAt,
    updatedAt: createdAt,
  };
}

const emptyCart: Cart = {
  id: "cart1",
  tenantId: "t1",
  userId: null,
  sessionId: null,
  createdAt,
  updatedAt: createdAt,
  items: [],
};

const filledCart: Cart = {
  ...emptyCart,
  items: [item("ci1", "p1", null, 2)],
};

const product = {
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
  isPublished: true,
  isFeatured: false,
  tags: [],
  metadata: null,
  createdAt,
  updatedAt: createdAt,
  images: [],
  variants: [],
  attributeValues: [],
};

const variantProduct = {
  ...product,
  id: "p2",
  name: "T-Shirt",
  slug: "t-shirt",
  sku: "TS-1",
  price: 2000,
  taxCategoryId: "tax1",
  variants: [
    {
      id: "v1",
      productId: "p2",
      sku: "TS-1-RED",
      name: "Red",
      barcode: null,
      price: 1500,
      compareAtPrice: null,
      costPrice: null,
      stock: 5,
      options: { color: "red" },
      isDefault: true,
      isActive: true,
      createdAt,
      updatedAt: createdAt,
    },
  ],
};

const unpublishedProduct = { ...product, isPublished: false };

describe("DefaultCartService", () => {
  it("returns a cart by id", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findById.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(service.get("t1", "cart1")).resolves.toEqual(filledCart);
  });

  it("throws NotFoundError when the cart is missing", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findById.mockResolvedValue(null);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(service.get("t1", "missing")).rejects.toThrow(NotFoundError);
  });

  it("returns the existing cart for a user", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findByUserId.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(service.getOrCreateForUser("t1", "u1")).resolves.toEqual(filledCart);
    expect(cartsMock.create).not.toHaveBeenCalled();
  });

  it("creates a cart when the user has none", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findByUserId.mockResolvedValue(null);
    cartsMock.create.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(service.getOrCreateForUser("t1", "u1")).resolves.toEqual(filledCart);
    expect(cartsMock.create).toHaveBeenCalledWith("t1", { userId: "u1" });
  });

  it("rejects an empty userId", async () => {
    const { carts, products, pricing } = createDependencies();
    const service = new DefaultCartService(carts, products, pricing);

    await expect(service.getOrCreateForUser("t1", "  ")).rejects.toThrow(ValidationError);
  });

  it("returns the existing cart for a session", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findBySessionId.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(service.getOrCreateForSession("t1", "s1")).resolves.toEqual(filledCart);
    expect(cartsMock.create).not.toHaveBeenCalled();
  });

  it("creates a cart when the session has none", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findBySessionId.mockResolvedValue(null);
    cartsMock.create.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(service.getOrCreateForSession("t1", "s1")).resolves.toEqual(filledCart);
    expect(cartsMock.create).toHaveBeenCalledWith("t1", { sessionId: "s1" });
  });

  it("rejects a non-positive quantity on addItem", async () => {
    const { carts, products, pricing } = createDependencies();
    const service = new DefaultCartService(carts, products, pricing);

    await expect(
      service.addItem("t1", "cart1", { productId: "p1", quantity: 0 }),
    ).rejects.toThrow(ValidationError);
    await expect(
      service.addItem("t1", "cart1", { productId: "p1", quantity: -1 }),
    ).rejects.toThrow(ValidationError);
    await expect(
      service.addItem("t1", "cart1", { productId: "p1", quantity: 1.5 }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError when the product is missing on addItem", async () => {
    const { carts, products, productsMock, pricing } = createDependencies();
    productsMock.findById.mockResolvedValue(null);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(
      service.addItem("t1", "cart1", { productId: "missing", quantity: 1 }),
    ).rejects.toThrow(NotFoundError);
  });

  it("rejects adding an unpublished product", async () => {
    const { carts, products, productsMock, pricing } = createDependencies();
    productsMock.findById.mockResolvedValue(unpublishedProduct);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(
      service.addItem("t1", "cart1", { productId: "p1", quantity: 1 }),
    ).rejects.toThrow(ValidationError);
  });

  it("throws NotFoundError when the variant does not belong to the product", async () => {
    const { carts, products, productsMock, pricing } = createDependencies();
    productsMock.findById.mockResolvedValue(variantProduct);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(
      service.addItem("t1", "cart1", { productId: "p2", variantId: "missing", quantity: 1 }),
    ).rejects.toThrow(NotFoundError);
  });

  it("rejects an inactive variant", async () => {
    const { carts, products, productsMock, pricing } = createDependencies();
    productsMock.findById.mockResolvedValue({
      ...variantProduct,
      variants: [{ ...variantProduct.variants[0], isActive: false }],
    });
    const service = new DefaultCartService(carts, products, pricing);

    await expect(
      service.addItem("t1", "cart1", { productId: "p2", variantId: "v1", quantity: 1 }),
    ).rejects.toThrow(ValidationError);
  });

  it("upserts an item and returns the refreshed cart", async () => {
    const { carts, cartsMock, products, productsMock, pricing } = createDependencies();
    productsMock.findById.mockResolvedValue(product);
    cartsMock.upsertItem.mockResolvedValue({});
    cartsMock.findById.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    const result = await service.addItem("t1", "cart1", {
      productId: "p1",
      quantity: 2,
    });

    expect(cartsMock.upsertItem).toHaveBeenCalledWith("t1", "cart1", {
      productId: "p1",
      quantity: 2,
    });
    expect(result).toEqual(filledCart);
  });

  it("throws NotFoundError when the item is missing on updateItemQuantity", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findById.mockResolvedValue(emptyCart);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(
      service.updateItemQuantity("t1", "cart1", "missing", 3),
    ).rejects.toThrow(NotFoundError);
  });

  it("rejects a negative quantity on updateItemQuantity", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findById.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(
      service.updateItemQuantity("t1", "cart1", "ci1", -1),
    ).rejects.toThrow(ValidationError);
  });

  it("removes the item when the quantity is zero", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findById.mockResolvedValue(filledCart);
    cartsMock.removeItem.mockResolvedValue(undefined);
    const service = new DefaultCartService(carts, products, pricing);

    const result = await service.updateItemQuantity("t1", "cart1", "ci1", 0);

    expect(cartsMock.removeItem).toHaveBeenCalledWith("t1", "cart1", "ci1");
    expect(cartsMock.upsertItem).not.toHaveBeenCalled();
    expect(result).toEqual(filledCart);
  });

  it("upserts the quantity delta and returns the refreshed cart", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findById.mockResolvedValue(filledCart);
    cartsMock.upsertItem.mockResolvedValue({});
    const service = new DefaultCartService(carts, products, pricing);

    const result = await service.updateItemQuantity("t1", "cart1", "ci1", 5);

    expect(cartsMock.upsertItem).toHaveBeenCalledWith("t1", "cart1", {
      productId: "p1",
      variantId: null,
      quantity: 3,
    });
    expect(result).toEqual(filledCart);
  });

  it("removes an item and returns the refreshed cart", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.removeItem.mockResolvedValue(undefined);
    cartsMock.findById.mockResolvedValue(emptyCart);
    const service = new DefaultCartService(carts, products, pricing);

    const result = await service.removeItem("t1", "cart1", "ci1");

    expect(cartsMock.removeItem).toHaveBeenCalledWith("t1", "cart1", "ci1");
    expect(result).toEqual(emptyCart);
  });

  it("clears the cart and returns the refreshed cart", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.clear.mockResolvedValue(undefined);
    cartsMock.findById.mockResolvedValue(emptyCart);
    const service = new DefaultCartService(carts, products, pricing);

    const result = await service.clear("t1", "cart1");

    expect(cartsMock.clear).toHaveBeenCalledWith("t1", "cart1");
    expect(result).toEqual(emptyCart);
  });

  it("returns the user cart when there is no guest cart to merge", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findBySessionId.mockResolvedValue(null);
    cartsMock.findByUserId.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(service.mergeGuestCart("t1", "s1", "u1")).resolves.toEqual(filledCart);
    expect(cartsMock.create).not.toHaveBeenCalled();
    expect(cartsMock.delete).not.toHaveBeenCalled();
  });

  it("creates a user cart and returns it when the guest cart is empty", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findBySessionId.mockResolvedValue(null);
    cartsMock.findByUserId.mockResolvedValue(null);
    cartsMock.create.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    const result = await service.mergeGuestCart("t1", "s1", "u1");

    expect(cartsMock.create).toHaveBeenCalledWith("t1", { userId: "u1" });
    expect(cartsMock.delete).not.toHaveBeenCalled();
    expect(result).toEqual(filledCart);
  });

  it("merges guest items into the user cart and deletes the guest cart", async () => {
    const guestCart: Cart = {
      ...emptyCart,
      id: "guest1",
      sessionId: "s1",
      items: [
        item("gi1", "p1", null, 2),
        item("gi2", "p2", "v1", 1),
      ],
    };
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findBySessionId.mockResolvedValue(guestCart);
    cartsMock.findByUserId.mockResolvedValue(filledCart);
    cartsMock.delete.mockResolvedValue(undefined);
    cartsMock.findById.mockResolvedValue(filledCart);
    const service = new DefaultCartService(carts, products, pricing);

    const result = await service.mergeGuestCart("t1", "s1", "u1");

    expect(cartsMock.upsertItem).toHaveBeenCalledTimes(2);
    expect(cartsMock.upsertItem).toHaveBeenCalledWith("t1", "cart1", {
      productId: "p1",
      variantId: null,
      quantity: 2,
    });
    expect(cartsMock.upsertItem).toHaveBeenCalledWith("t1", "cart1", {
      productId: "p2",
      variantId: "v1",
      quantity: 1,
    });
    expect(cartsMock.delete).toHaveBeenCalledWith("t1", "guest1");
    expect(result).toEqual(filledCart);
  });

  it("throws NotFoundError when the cart is missing on priceCart", async () => {
    const { carts, cartsMock, products, pricing } = createDependencies();
    cartsMock.findById.mockResolvedValue(null);
    const service = new DefaultCartService(carts, products, pricing);

    await expect(
      service.priceCart("t1", "missing", { currency: "usd" }),
    ).rejects.toThrow(NotFoundError);
  });

  it("delegates pricing with lines built from product prices", async () => {
    const twoItemCart: Cart = {
      ...emptyCart,
      items: [item("ci1", "p1", null, 2)],
    };
    const { carts, cartsMock, products, productsMock, pricing, pricingMock } =
      createDependencies();
    cartsMock.findById.mockResolvedValue(twoItemCart);
    productsMock.findById.mockResolvedValue(product);
    pricingMock.calculatePrice.mockResolvedValue({
      currency: "usd",
      lines: [{ id: "ci1", unitPrice: 2999, quantity: 2, lineTotal: 5998, tax: 0 }],
      breakdown: {
        currency: "usd",
        subtotal: 5998,
        discountAmount: 0,
        shippingCost: 0,
        tax: 0,
        total: 5998,
      },
      appliedCoupon: null,
    });
    const service = new DefaultCartService(carts, products, pricing);

    const result = await service.priceCart("t1", "cart1", { currency: "usd" });

    expect(productsMock.findById).toHaveBeenCalledWith("t1", "p1");
    expect(pricingMock.calculatePrice).toHaveBeenCalledWith({
      currency: "usd",
      lines: [{ id: "ci1", unitPrice: 2999, quantity: 2, taxCategoryId: null }],
      coupon: null,
      shippingCost: undefined,
      taxRate: undefined,
      taxRates: undefined,
    });
    expect(result.breakdown.subtotal).toBe(5998);
  });

  it("uses the variant price and passes through pricing options", async () => {
    const variantCart: Cart = {
      ...emptyCart,
      items: [item("ci1", "p2", "v1", 1)],
    };
    const { carts, cartsMock, products, productsMock, pricing, pricingMock } =
      createDependencies();
    cartsMock.findById.mockResolvedValue(variantCart);
    productsMock.findById.mockResolvedValue(variantProduct);
    pricingMock.calculatePrice.mockResolvedValue({});
    const service = new DefaultCartService(carts, products, pricing);

    await service.priceCart("t1", "cart1", {
      currency: "eur",
      coupon: { code: "SAVE10", type: "PERCENTAGE", value: 10 },
      shippingCost: 500,
      taxRate: 20,
    });

    expect(pricingMock.calculatePrice).toHaveBeenCalledWith({
      currency: "eur",
      lines: [{ id: "ci1", unitPrice: 1500, quantity: 1, taxCategoryId: "tax1" }],
      coupon: { code: "SAVE10", type: "PERCENTAGE", value: 10 },
      shippingCost: 500,
      taxRate: 20,
      taxRates: undefined,
    });
  });
});

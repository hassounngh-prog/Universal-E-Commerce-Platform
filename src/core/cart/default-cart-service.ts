import { NotFoundError, ValidationError } from "@/shared/errors/platform-error";
import type { PricingEngine } from "@/core/pricing/pricing-engine.interface";
import type { PricingLine, PricingResult } from "@/core/pricing/types";
import type { ProductRepository } from "@/core/product/product-repository.interface";
import type { Product } from "@/core/product/types";
import type { CartRepository } from "./cart-repository.interface";
import type { CartService } from "./cart-service.interface";
import type { AddCartItemInput, Cart, PriceCartInput } from "./types";

export class DefaultCartService implements CartService {
  constructor(
    private readonly carts: CartRepository,
    private readonly products: ProductRepository,
    private readonly pricing: PricingEngine,
  ) {}

  async get(tenantId: string | null, cartId: string): Promise<Cart> {
    const cart = await this.carts.findById(tenantId, cartId);
    if (!cart) {
      throw new NotFoundError(`Cart ${cartId} not found`);
    }
    return cart;
  }

  async getOrCreateForUser(tenantId: string | null, userId: string): Promise<Cart> {
    this.requireValue(userId, "userId");
    const existing = await this.carts.findByUserId(tenantId, userId);
    if (existing) {
      return existing;
    }
    return this.carts.create(tenantId, { userId });
  }

  async getOrCreateForSession(tenantId: string | null, sessionId: string): Promise<Cart> {
    this.requireValue(sessionId, "sessionId");
    const existing = await this.carts.findBySessionId(tenantId, sessionId);
    if (existing) {
      return existing;
    }
    return this.carts.create(tenantId, { sessionId });
  }

  async addItem(
    tenantId: string | null,
    cartId: string,
    input: AddCartItemInput,
  ): Promise<Cart> {
    if (!Number.isInteger(input.quantity) || input.quantity < 1) {
      throw new ValidationError("Cart item quantity must be a positive integer");
    }
    await this.resolveProduct(tenantId, input.productId, input.variantId ?? null);
    await this.carts.upsertItem(tenantId, cartId, input);
    return this.get(tenantId, cartId);
  }

  async updateItemQuantity(
    tenantId: string | null,
    cartId: string,
    itemId: string,
    quantity: number,
  ): Promise<Cart> {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new ValidationError("Cart item quantity must be a non-negative integer");
    }
    const cart = await this.get(tenantId, cartId);
    const item = cart.items.find((entry) => entry.id === itemId);
    if (!item) {
      throw new NotFoundError(`Cart item ${itemId} not found`);
    }
    if (quantity === 0) {
      await this.carts.removeItem(tenantId, cartId, itemId);
      return this.get(tenantId, cartId);
    }
    const delta = quantity - item.quantity;
    if (delta !== 0) {
      await this.carts.upsertItem(tenantId, cartId, {
        productId: item.productId,
        variantId: item.variantId,
        quantity: delta,
      });
    }
    return this.get(tenantId, cartId);
  }

  async removeItem(tenantId: string | null, cartId: string, itemId: string): Promise<Cart> {
    await this.carts.removeItem(tenantId, cartId, itemId);
    return this.get(tenantId, cartId);
  }

  async clear(tenantId: string | null, cartId: string): Promise<Cart> {
    await this.carts.clear(tenantId, cartId);
    return this.get(tenantId, cartId);
  }

  async mergeGuestCart(
    tenantId: string | null,
    guestSessionId: string,
    userId: string,
  ): Promise<Cart> {
    this.requireValue(guestSessionId, "guestSessionId");
    this.requireValue(userId, "userId");
    const guestCart = await this.carts.findBySessionId(tenantId, guestSessionId);
    let userCart = await this.carts.findByUserId(tenantId, userId);
    if (!userCart) {
      userCart = await this.carts.create(tenantId, { userId });
    }
    if (guestCart) {
      for (const item of guestCart.items) {
        await this.carts.upsertItem(tenantId, userCart.id, {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
        });
      }
      await this.carts.delete(tenantId, guestCart.id);
      userCart = await this.get(tenantId, userCart.id);
    }
    return userCart;
  }

  async priceCart(
    tenantId: string | null,
    cartId: string,
    input: PriceCartInput,
  ): Promise<PricingResult> {
    const cart = await this.get(tenantId, cartId);
    const lines: PricingLine[] = [];
    for (const item of cart.items) {
      const product = await this.products.findById(tenantId, item.productId);
      if (!product) {
        throw new NotFoundError(`Product ${item.productId} not found`);
      }
      lines.push({
        id: item.id,
        unitPrice: this.resolveUnitPrice(product, item.variantId),
        quantity: item.quantity,
        taxCategoryId: product.taxCategoryId,
      });
    }
    return this.pricing.calculatePrice({
      currency: input.currency,
      lines,
      coupon: input.coupon ?? null,
      shippingCost: input.shippingCost,
      taxRate: input.taxRate,
      taxRates: input.taxRates,
    });
  }

  private requireValue(value: string, label: string): void {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new ValidationError(`${label} is required`);
    }
  }

  private async resolveProduct(
    tenantId: string | null,
    productId: string,
    variantId: string | null,
  ): Promise<Product> {
    const product = await this.products.findById(tenantId, productId);
    if (!product) {
      throw new NotFoundError(`Product ${productId} not found`);
    }
    if (!product.isPublished) {
      throw new ValidationError(`Product ${productId} is not published`);
    }
    if (variantId) {
      const variant = product.variants.find((entry) => entry.id === variantId);
      if (!variant) {
        throw new NotFoundError(`Variant ${variantId} not found`);
      }
      if (!variant.isActive) {
        throw new ValidationError(`Variant ${variantId} is not active`);
      }
    }
    return product;
  }

  private resolveUnitPrice(product: Product, variantId: string | null): number {
    if (variantId) {
      const variant = product.variants.find((entry) => entry.id === variantId);
      if (!variant) {
        throw new NotFoundError(`Variant ${variantId} not found`);
      }
      return variant.price ?? product.price;
    }
    return product.price;
  }
}

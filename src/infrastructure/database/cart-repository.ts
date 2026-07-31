import { prisma } from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/errors/platform-error";
import type { CartRepository } from "@/core/cart/cart-repository.interface";
import type { AddCartItemInput, Cart, CartItem, CreateCartInput } from "@/core/cart/types";
import type {
  Cart as CartRow,
  CartItem as CartItemRow,
} from "@/generated/prisma/client";

interface CartWithItems extends CartRow {
  items?: CartItemRow[];
}

function tenantScope(tenantId: string | null): { tenantId: string } | Record<string, never> {
  return tenantId ? { tenantId } : {};
}

function toDomain(row: CartWithItems): Cart {
  return {
    id: row.id,
    tenantId: row.tenantId,
    userId: row.userId,
    sessionId: row.sessionId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: (row.items ?? []).map(toItemDomain),
  };
}

function toItemDomain(row: CartItemRow): CartItem {
  return {
    id: row.id,
    cartId: row.cartId,
    productId: row.productId,
    variantId: row.variantId,
    quantity: row.quantity,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaCartRepository implements CartRepository {
  async findById(tenantId: string | null, id: string): Promise<Cart | null> {
    const row = (await prisma.cart.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: { items: true },
    })) as CartWithItems | null;
    return row ? toDomain(row) : null;
  }

  async findByUserId(tenantId: string | null, userId: string): Promise<Cart | null> {
    const row = (await prisma.cart.findFirst({
      where: { userId, ...tenantScope(tenantId) },
      include: { items: true },
    })) as CartWithItems | null;
    return row ? toDomain(row) : null;
  }

  async findBySessionId(tenantId: string | null, sessionId: string): Promise<Cart | null> {
    const row = (await prisma.cart.findFirst({
      where: { sessionId, ...tenantScope(tenantId) },
      include: { items: true },
    })) as CartWithItems | null;
    return row ? toDomain(row) : null;
  }

  async create(tenantId: string | null, input: CreateCartInput): Promise<Cart> {
    const row = (await prisma.cart.create({
      data: {
        tenantId: tenantId ?? null,
        userId: input.userId ?? null,
        sessionId: input.sessionId ?? null,
      },
      include: { items: true },
    })) as CartWithItems;
    return toDomain(row);
  }

  async upsertItem(
    tenantId: string | null,
    cartId: string,
    input: AddCartItemInput,
  ): Promise<CartItem> {
    const cart = await this.findById(tenantId, cartId);
    if (!cart) {
      throw new NotFoundError(`Cart ${cartId} not found`);
    }

    const existing = await prisma.cartItem.findFirst({
      where: {
        cartId,
        productId: input.productId,
        variantId: input.variantId ?? null,
      },
    });

    if (existing) {
      const row = await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: { increment: input.quantity } },
      });
      return toItemDomain(row);
    }

    const row = await prisma.cartItem.create({
      data: {
        cartId,
        productId: input.productId,
        variantId: input.variantId ?? null,
        quantity: input.quantity,
      },
    });
    return toItemDomain(row);
  }

  async removeItem(tenantId: string | null, cartId: string, itemId: string): Promise<void> {
    const cart = await this.findById(tenantId, cartId);
    if (!cart) {
      throw new NotFoundError(`Cart ${cartId} not found`);
    }
    await prisma.cartItem.deleteMany({ where: { id: itemId, cartId } });
  }

  async clear(tenantId: string | null, cartId: string): Promise<void> {
    const cart = await this.findById(tenantId, cartId);
    if (!cart) {
      throw new NotFoundError(`Cart ${cartId} not found`);
    }
    await prisma.cartItem.deleteMany({ where: { cartId } });
  }

  async delete(tenantId: string | null, id: string): Promise<void> {
    const result = await prisma.cart.deleteMany({
      where: { id, ...tenantScope(tenantId) },
    });
    if (result.count === 0) {
      throw new NotFoundError(`Cart ${id} not found`);
    }
  }
}

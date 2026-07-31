import type { AddCartItemInput, Cart, CartItem, CreateCartInput } from "./types";

export interface CartRepository {
  findById(tenantId: string | null, id: string): Promise<Cart | null>;
  findByUserId(tenantId: string | null, userId: string): Promise<Cart | null>;
  findBySessionId(tenantId: string | null, sessionId: string): Promise<Cart | null>;
  create(tenantId: string | null, input: CreateCartInput): Promise<Cart>;
  upsertItem(tenantId: string | null, cartId: string, input: AddCartItemInput): Promise<CartItem>;
  removeItem(tenantId: string | null, cartId: string, itemId: string): Promise<void>;
  clear(tenantId: string | null, cartId: string): Promise<void>;
  delete(tenantId: string | null, id: string): Promise<void>;
}

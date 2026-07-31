import type { PricingResult } from "@/core/pricing/types";
import type { AddCartItemInput, Cart, PriceCartInput } from "./types";

export interface CartService {
  get(tenantId: string | null, cartId: string): Promise<Cart>;
  getOrCreateForUser(tenantId: string | null, userId: string): Promise<Cart>;
  getOrCreateForSession(tenantId: string | null, sessionId: string): Promise<Cart>;
  addItem(tenantId: string | null, cartId: string, input: AddCartItemInput): Promise<Cart>;
  updateItemQuantity(
    tenantId: string | null,
    cartId: string,
    itemId: string,
    quantity: number,
  ): Promise<Cart>;
  removeItem(tenantId: string | null, cartId: string, itemId: string): Promise<Cart>;
  clear(tenantId: string | null, cartId: string): Promise<Cart>;
  mergeGuestCart(tenantId: string | null, guestSessionId: string, userId: string): Promise<Cart>;
  priceCart(tenantId: string | null, cartId: string, input: PriceCartInput): Promise<PricingResult>;
}

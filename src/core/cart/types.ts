export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Cart {
  id: string;
  tenantId: string | null;
  userId: string | null;
  sessionId: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: CartItem[];
}

export interface CreateCartInput {
  userId?: string | null;
  sessionId?: string | null;
}

export interface AddCartItemInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
}

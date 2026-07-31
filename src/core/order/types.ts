export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string | null;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
}

export interface OrderAddress {
  id: string;
  orderId: string;
  label: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  tenantId: string | null;
  orderNumber: string;
  userId: string | null;
  email: string;
  status: OrderStatus;
  subtotal: number;
  discountAmount: number;
  shippingCost: number;
  tax: number;
  total: number;
  currency: string;
  taxBreakdown: Record<string, unknown> | null;
  shippingCarrier: string | null;
  shippingMethod: string | null;
  trackingNumber: string | null;
  notes: string | null;
  paidAt: Date | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  items: OrderItem[];
  address: OrderAddress | null;
}

export interface CreateOrderItemInput {
  productId: string;
  variantId?: string | null;
  name: string;
  price: number;
  quantity: number;
  image?: string | null;
}

export interface CreateOrderAddressInput {
  label?: string | null;
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CreateOrderInput {
  orderNumber: string;
  userId?: string | null;
  email: string;
  status?: OrderStatus;
  subtotal: number;
  discountAmount?: number;
  shippingCost?: number;
  tax?: number;
  total: number;
  currency?: string;
  taxBreakdown?: Record<string, unknown> | null;
  shippingCarrier?: string | null;
  shippingMethod?: string | null;
  notes?: string | null;
  items: CreateOrderItemInput[];
  address?: CreateOrderAddressInput | null;
}

export interface UpdateOrderInput {
  status?: OrderStatus;
  email?: string;
  subtotal?: number;
  discountAmount?: number;
  shippingCost?: number;
  tax?: number;
  total?: number;
  taxBreakdown?: Record<string, unknown> | null;
  shippingCarrier?: string | null;
  shippingMethod?: string | null;
  trackingNumber?: string | null;
  notes?: string | null;
  paidAt?: Date | null;
  shippedAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
}

export interface OrderListFilter {
  status?: OrderStatus;
  userId?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderListResult {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

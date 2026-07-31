import type { PaymentResult } from "@/core/payment/payment-provider.interface";
import type {
  PackageDimensions,
  ShippingAddress,
  ShippingLabel,
  ShippingRate,
} from "@/core/shipping/shipping-provider.interface";
import type { TaxCalculation } from "@/core/tax/tax-provider.interface";
import type { CouponInput, PricingResult } from "@/core/pricing/types";
import type {
  CreateOrderAddressInput,
  Order,
  OrderListFilter,
  OrderListResult,
  OrderStatus,
  UpdateOrderInput,
} from "./types";

export interface CreateOrderFromCartInput {
  cartId: string;
  email: string;
  userId?: string | null;
  address: CreateOrderAddressInput;
  currency?: string;
  coupon?: CouponInput | null;
  shippingCost?: number;
  taxRate?: number;
  taxRates?: Record<string, number>;
  shippingCarrier?: string | null;
  shippingMethod?: string | null;
  notes?: string | null;
  orderNumber?: string;
}

export interface TransitionOrderOptions {
  trackingNumber?: string | null;
  paidAt?: Date | null;
}

export interface GetShippingRatesInput {
  orderId: string;
  fromPostalCode: string;
  toAddress: ShippingAddress;
  dimensions?: PackageDimensions;
}

export interface CreateOrderLabelInput {
  rate: ShippingRate;
  fromPostalCode: string;
  dimensions?: PackageDimensions;
}

export interface OrderService {
  get(tenantId: string | null, orderId: string): Promise<Order>;
  getByNumber(tenantId: string | null, orderNumber: string): Promise<Order>;
  list(tenantId: string | null, filter?: OrderListFilter): Promise<OrderListResult>;
  createFromCart(tenantId: string | null, input: CreateOrderFromCartInput): Promise<Order>;
  update(tenantId: string | null, orderId: string, input: UpdateOrderInput): Promise<Order>;
  transition(
    tenantId: string | null,
    orderId: string,
    status: OrderStatus,
    options?: TransitionOrderOptions,
  ): Promise<Order>;
  markPaid(tenantId: string | null, orderId: string): Promise<Order>;
  markShipped(
    tenantId: string | null,
    orderId: string,
    trackingNumber?: string | null,
  ): Promise<Order>;
  markDelivered(tenantId: string | null, orderId: string): Promise<Order>;
  cancel(tenantId: string | null, orderId: string): Promise<Order>;
  refund(tenantId: string | null, orderId: string): Promise<Order>;
  createPayment(tenantId: string | null, orderId: string): Promise<PaymentResult>;
  capturePayment(
    tenantId: string | null,
    orderId: string,
    paymentId: string,
  ): Promise<PaymentResult>;
  refundPayment(
    tenantId: string | null,
    orderId: string,
    paymentId: string,
  ): Promise<PaymentResult>;
  calculateTax(tenantId: string | null, orderId: string): Promise<TaxCalculation>;
  priceOrder(
    tenantId: string | null,
    input: CreateOrderFromCartInput,
  ): Promise<PricingResult>;
  getShippingRates(
    tenantId: string | null,
    input: GetShippingRatesInput,
  ): Promise<ShippingRate[]>;
  createLabel(
    tenantId: string | null,
    orderId: string,
    input: CreateOrderLabelInput,
  ): Promise<ShippingLabel>;
}

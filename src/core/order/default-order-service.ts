import { ConflictError, NotFoundError, ValidationError } from "@/shared/errors/platform-error";
import { PaymentStatus } from "@/core/payment/payment-provider.interface";
import type { PaymentProvider, PaymentResult } from "@/core/payment/payment-provider.interface";
import type { ShippingProvider } from "@/core/shipping/shipping-provider.interface";
import type {
  PackageDimensions,
  ShippingLabel,
  ShippingRate,
} from "@/core/shipping/shipping-provider.interface";
import type { TaxCalculation, TaxProvider } from "@/core/tax/tax-provider.interface";
import type { ProductRepository } from "@/core/product/product-repository.interface";
import type { Product } from "@/core/product/types";
import type { ProductService } from "@/core/product/product-service.interface";
import type { CartService } from "@/core/cart/cart-service.interface";
import type { PricingResult } from "@/core/pricing/types";
import type { OrderRepository } from "./order-repository.interface";
import type { OrderService } from "./order-service.interface";
import type {
  CreateOrderFromCartInput,
  CreateOrderLabelInput,
  GetShippingRatesInput,
  TransitionOrderOptions,
} from "./order-service.interface";
import type {
  CreateOrderItemInput,
  Order,
  OrderListFilter,
  OrderListResult,
  OrderStatus,
  UpdateOrderInput,
} from "./types";

const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "PROCESSING", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "SHIPPED", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

interface ProductDimensions {
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
}

export class DefaultOrderService implements OrderService {
  constructor(
    private readonly orders: OrderRepository,
    private readonly carts: CartService,
    private readonly products: ProductRepository,
    private readonly productService: ProductService,
    private readonly payment: PaymentProvider,
    private readonly tax: TaxProvider,
    private readonly shipping: ShippingProvider,
  ) {}

  async get(tenantId: string | null, orderId: string): Promise<Order> {
    const order = await this.orders.findById(tenantId, orderId);
    if (!order) {
      throw new NotFoundError(`Order ${orderId} not found`);
    }
    return order;
  }

  async getByNumber(tenantId: string | null, orderNumber: string): Promise<Order> {
    const order = await this.orders.findByNumber(tenantId, orderNumber);
    if (!order) {
      throw new NotFoundError(`Order ${orderNumber} not found`);
    }
    return order;
  }

  async list(tenantId: string | null, filter?: OrderListFilter): Promise<OrderListResult> {
    return this.orders.list(tenantId, filter);
  }

  async createFromCart(
    tenantId: string | null,
    input: CreateOrderFromCartInput,
  ): Promise<Order> {
    this.requireEmail(input.email);
    this.requireAddress(input.address);
    const cart = await this.carts.get(tenantId, input.cartId);
    if (cart.items.length === 0) {
      throw new ValidationError("Cart is empty");
    }

    const pricing = await this.carts.priceCart(tenantId, input.cartId, {
      currency: input.currency ?? "usd",
      coupon: input.coupon ?? null,
      shippingCost: input.shippingCost,
      taxRate: input.taxRate,
      taxRates: input.taxRates,
    });
    if (pricing.couponError) {
      throw new ValidationError(pricing.couponError);
    }

    const items: CreateOrderItemInput[] = [];
    for (const item of cart.items) {
      const product = await this.resolveProduct(tenantId, item.productId, item.variantId);
      const line = pricing.lines.find((entry) => entry.id === item.id);
      items.push({
        productId: item.productId,
        variantId: item.variantId,
        name: product.name,
        price: line ? line.unitPrice : product.price,
        quantity: item.quantity,
        image: product.images[0]?.url ?? null,
      });
    }

    const breakdown = pricing.breakdown;
    const order = await this.orders.create(tenantId, {
      orderNumber: await this.nextOrderNumber(tenantId, input.orderNumber),
      userId: input.userId ?? null,
      email: input.email,
      subtotal: breakdown.subtotal,
      discountAmount: breakdown.discountAmount,
      shippingCost: breakdown.shippingCost,
      tax: breakdown.tax,
      total: breakdown.total,
      currency: breakdown.currency,
      shippingCarrier: input.shippingCarrier ?? null,
      shippingMethod: input.shippingMethod ?? null,
      notes: input.notes ?? null,
      items,
      address: input.address,
    });

    for (const item of cart.items) {
      await this.productService.adjustStock(tenantId, item.productId, -item.quantity);
    }

    return order;
  }

  async update(
    tenantId: string | null,
    orderId: string,
    input: UpdateOrderInput,
  ): Promise<Order> {
    return this.orders.update(tenantId, orderId, input);
  }

  async transition(
    tenantId: string | null,
    orderId: string,
    status: OrderStatus,
    options: TransitionOrderOptions = {},
  ): Promise<Order> {
    const order = await this.get(tenantId, orderId);
    if (order.status === status) {
      return order;
    }
    const allowed = TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(status)) {
      throw new ValidationError(
        `Cannot transition order ${orderId} from ${order.status} to ${status}`,
      );
    }
    const update: UpdateOrderInput = { status };
    if (status === "CONFIRMED") {
      update.paidAt = options.paidAt ?? new Date();
    }
    if (status === "SHIPPED") {
      update.shippedAt = new Date();
      if (options.trackingNumber !== undefined) {
        update.trackingNumber = options.trackingNumber ?? null;
      }
    }
    if (status === "DELIVERED") {
      update.deliveredAt = new Date();
    }
    if (status === "CANCELLED") {
      update.cancelledAt = new Date();
    }
    return this.orders.update(tenantId, orderId, update);
  }

  async markPaid(tenantId: string | null, orderId: string): Promise<Order> {
    return this.transition(tenantId, orderId, "CONFIRMED");
  }

  async markShipped(
    tenantId: string | null,
    orderId: string,
    trackingNumber?: string | null,
  ): Promise<Order> {
    return this.transition(tenantId, orderId, "SHIPPED", { trackingNumber: trackingNumber ?? null });
  }

  async markDelivered(tenantId: string | null, orderId: string): Promise<Order> {
    return this.transition(tenantId, orderId, "DELIVERED");
  }

  async cancel(tenantId: string | null, orderId: string): Promise<Order> {
    return this.transition(tenantId, orderId, "CANCELLED");
  }

  async refund(tenantId: string | null, orderId: string): Promise<Order> {
    return this.transition(tenantId, orderId, "REFUNDED");
  }

  async createPayment(tenantId: string | null, orderId: string): Promise<PaymentResult> {
    const order = await this.get(tenantId, orderId);
    const result = await this.payment.createPayment({
      amount: { amount: order.total, currency: order.currency },
      currency: order.currency,
      reference: order.orderNumber,
      description: `Order ${order.orderNumber}`,
      customer: order.userId ? { id: order.userId, email: order.email } : { email: order.email },
      metadata: { orderId: order.id },
    });
    if (
      result.success &&
      (result.status === PaymentStatus.Authorized || result.status === PaymentStatus.Captured)
    ) {
      await this.markPaid(tenantId, orderId);
    }
    return result;
  }

  async capturePayment(
    tenantId: string | null,
    orderId: string,
    paymentId: string,
  ): Promise<PaymentResult> {
    await this.get(tenantId, orderId);
    const result = await this.payment.capturePayment(paymentId);
    if (result.success && result.status === PaymentStatus.Captured) {
      await this.markPaid(tenantId, orderId);
    }
    return result;
  }

  async refundPayment(
    tenantId: string | null,
    orderId: string,
    paymentId: string,
  ): Promise<PaymentResult> {
    const order = await this.get(tenantId, orderId);
    if (order.status === "REFUNDED") {
      throw new ConflictError(`Order ${orderId} is already refunded`);
    }
    const result = await this.payment.refundPayment(paymentId);
    if (result.success && result.status === PaymentStatus.Refunded) {
      await this.refund(tenantId, orderId);
    }
    return result;
  }

  async calculateTax(tenantId: string | null, orderId: string): Promise<TaxCalculation> {
    const order = await this.get(tenantId, orderId);
    if (!order.address) {
      throw new ValidationError(`Order ${orderId} has no shipping address`);
    }
    return this.tax.calculate({
      toAddress: {
        countryCode: order.address.country,
        postalCode: order.address.postalCode,
        region: order.address.state,
        city: order.address.city,
      },
      currency: order.currency,
      lines: order.items.map((item) => ({
        id: item.id,
        amount: { amount: item.price * item.quantity, currency: order.currency },
        quantity: item.quantity,
      })),
    });
  }

  async priceOrder(
    tenantId: string | null,
    input: CreateOrderFromCartInput,
  ): Promise<PricingResult> {
    return this.carts.priceCart(tenantId, input.cartId, {
      currency: input.currency ?? "usd",
      coupon: input.coupon ?? null,
      shippingCost: input.shippingCost,
      taxRate: input.taxRate,
      taxRates: input.taxRates,
    });
  }

  async getShippingRates(
    tenantId: string | null,
    input: GetShippingRatesInput,
  ): Promise<ShippingRate[]> {
    const order = await this.get(tenantId, input.orderId);
    if (order.items.length === 0) {
      throw new ValidationError(`Order ${input.orderId} has no items`);
    }
    const dimensions = input.dimensions ?? (await this.resolveDimensions(tenantId, order));
    return this.shipping.getRates({
      fromPostalCode: input.fromPostalCode,
      toAddress: input.toAddress,
      dimensions,
      declaredValue: { amount: order.total, currency: order.currency },
      items: order.items.map((item) => ({
        quantity: item.quantity,
        price: { amount: item.price, currency: order.currency },
      })),
    });
  }

  async createLabel(
    tenantId: string | null,
    orderId: string,
    input: CreateOrderLabelInput,
  ): Promise<ShippingLabel> {
    const order = await this.get(tenantId, orderId);
    if (!order.address) {
      throw new ValidationError(`Order ${orderId} has no shipping address`);
    }
    const dimensions = input.dimensions ?? (await this.resolveDimensions(tenantId, order));
    const label = await this.shipping.createLabel({
      shipmentId: order.id,
      rate: input.rate,
      toAddress: {
        addressLine1: order.address.line1,
        addressLine2: order.address.line2 ?? undefined,
        city: order.address.city,
        region: order.address.state,
        postalCode: order.address.postalCode,
        country: order.address.country,
      },
      fromPostalCode: input.fromPostalCode,
      dimensions,
    });
    await this.markShipped(tenantId, orderId, label.trackingNumber);
    return label;
  }

  private async nextOrderNumber(tenantId: string | null, override?: string): Promise<string> {
    if (override) {
      const existing = await this.orders.findByNumber(tenantId, override);
      if (existing) {
        throw new ConflictError(`Order number ${override} already exists`);
      }
      return override;
    }
    for (let attempt = 0; attempt < 10; attempt += 1) {
      const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
      const candidate = `ORD-${Date.now().toString(36).toUpperCase()}${suffix}`;
      if (!(await this.orders.findByNumber(tenantId, candidate))) {
        return candidate;
      }
    }
    throw new ConflictError("Could not generate a unique order number");
  }

  private async resolveDimensions(tenantId: string | null, order: Order): Promise<PackageDimensions> {
    let weightKg = 0;
    let lengthCm = 0;
    let widthCm = 0;
    let heightCm = 0;
    for (const item of order.items) {
      const product = await this.products.findById(tenantId, item.productId);
      if (!product) {
        continue;
      }
      weightKg += (product.weightKg ?? 0) * item.quantity;
      const dimensions = (product.dimensions ?? null) as ProductDimensions | null;
      lengthCm = Math.max(lengthCm, dimensions?.lengthCm ?? 0);
      widthCm = Math.max(widthCm, dimensions?.widthCm ?? 0);
      heightCm = Math.max(heightCm, dimensions?.heightCm ?? 0);
    }
    return { weightKg, lengthCm, widthCm, heightCm };
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

  private requireEmail(email: string): void {
    this.requireValue(email, "email");
  }

  private requireAddress(address: { line1: string; city: string; country: string }): void {
    this.requireValue(address.line1, "address.line1");
    this.requireValue(address.city, "address.city");
    this.requireValue(address.country, "address.country");
  }

  private requireValue(value: string, label: string): void {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new ValidationError(`${label} is required`);
    }
  }
}

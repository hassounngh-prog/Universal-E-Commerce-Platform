import { describe, expect, it, vi } from "vitest";
import { DefaultOrderService } from "./default-order-service";
import {
  ConflictError,
  NotFoundError,
  ValidationError,
} from "@/shared/errors/platform-error";
import { PaymentStatus } from "@/core/payment/payment-provider.interface";
import type { PaymentProvider } from "@/core/payment/payment-provider.interface";
import type { ShippingProvider } from "@/core/shipping/shipping-provider.interface";
import type { TaxProvider } from "@/core/tax/tax-provider.interface";
import type { CartService } from "@/core/cart/cart-service.interface";
import type { ProductRepository } from "@/core/product/product-repository.interface";
import type { Product } from "@/core/product/types";
import type { ProductService } from "@/core/product/product-service.interface";
import type { OrderRepository } from "./order-repository.interface";
import type { Cart } from "@/core/cart/types";
import type { Order } from "./types";

function createDependencies() {
  const orders = {
    findById: vi.fn(),
    findByNumber: vi.fn(),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  };
  const carts = {
    get: vi.fn(),
    priceCart: vi.fn(),
  };
  const products = {
    findById: vi.fn(),
  };
  const productService = {
    adjustStock: vi.fn(),
  };
  const payment = {
    id: "test-payment",
    name: "Test Payment",
    createPayment: vi.fn(),
    capturePayment: vi.fn(),
    refundPayment: vi.fn(),
    handleWebhook: vi.fn(),
  };
  const tax = {
    id: "test-tax",
    name: "Test Tax",
    calculate: vi.fn(),
  };
  const shipping = {
    id: "test-shipping",
    name: "Test Shipping",
    getRates: vi.fn(),
    createLabel: vi.fn(),
    track: vi.fn(),
  };
  return {
    orders: orders as unknown as OrderRepository,
    carts: carts as unknown as CartService,
    products: products as unknown as ProductRepository,
    productService: productService as unknown as ProductService,
    payment: payment as unknown as PaymentProvider,
    tax: tax as unknown as TaxProvider,
    shipping: shipping as unknown as ShippingProvider,
    ordersMock: orders,
    cartsMock: carts,
    productsMock: products,
    productServiceMock: productService,
    paymentMock: payment,
    taxMock: tax,
    shippingMock: shipping,
  };
}

function createService(deps: ReturnType<typeof createDependencies>): DefaultOrderService {
  return new DefaultOrderService(
    deps.orders,
    deps.carts,
    deps.products,
    deps.productService,
    deps.payment,
    deps.tax,
    deps.shipping,
  );
}

const createdAt = new Date("2026-01-01T00:00:00Z");

function cartItem(
  id: string,
  productId: string,
  variantId: string | null,
  quantity: number,
): Cart["items"][number] {
  return { id, cartId: "cart1", productId, variantId, quantity, createdAt, updatedAt: createdAt };
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
  items: [cartItem("ci1", "p1", null, 2)],
};

const product: Product = {
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
  weightKg: 0.5,
  dimensions: { lengthCm: 20, widthCm: 10, heightCm: 5 },
  requiresShipping: true,
  categoryId: null,
  isPublished: true,
  isFeatured: false,
  tags: [],
  metadata: null,
  createdAt,
  updatedAt: createdAt,
  images: [{ id: "img1", url: "https://cdn.example.com/img.jpg", alt: null, order: 0 }],
  variants: [],
  attributeValues: [],
};

const variantProduct: Product = {
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

const unpublishedProduct: Product = { ...product, isPublished: false };

const pricingResult = {
  currency: "usd",
  lines: [{ id: "ci1", unitPrice: 2999, quantity: 2, lineTotal: 5998, tax: 0 }],
  breakdown: {
    currency: "usd",
    subtotal: 5998,
    discountAmount: 0,
    shippingCost: 500,
    tax: 0,
    total: 6498,
  },
  appliedCoupon: null,
};

const order: Order = {
  id: "ord1",
  tenantId: "t1",
  orderNumber: "ORD-ABC123",
  userId: null,
  email: "buyer@example.com",
  status: "PENDING",
  subtotal: 5998,
  discountAmount: 0,
  shippingCost: 500,
  tax: 0,
  total: 6498,
  currency: "usd",
  taxBreakdown: null,
  shippingCarrier: null,
  shippingMethod: null,
  trackingNumber: null,
  notes: null,
  paidAt: null,
  shippedAt: null,
  deliveredAt: null,
  cancelledAt: null,
  createdAt,
  updatedAt: createdAt,
  items: [
    {
      id: "oi1",
      orderId: "ord1",
      productId: "p1",
      variantId: null,
      name: "Anime Figurine",
      price: 2999,
      quantity: 2,
      image: null,
    },
  ],
  address: null,
};

const orderWithAddress: Order = {
  ...order,
  address: {
    id: "addr1",
    orderId: "ord1",
    label: null,
    line1: "1 Main St",
    line2: null,
    city: "Springfield",
    state: "IL",
    postalCode: "62701",
    country: "US",
  },
};

const confirmedOrder: Order = { ...order, status: "CONFIRMED", paidAt: createdAt };
const confirmedOrderWithAddress: Order = { ...orderWithAddress, status: "CONFIRMED", paidAt: createdAt };

const addressInput = {
  line1: "1 Main St",
  city: "Springfield",
  state: "IL",
  postalCode: "62701",
  country: "US",
};

describe("DefaultOrderService", () => {
  describe("get", () => {
    it("returns an order by id", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      const service = createService(deps);

      await expect(service.get("t1", "ord1")).resolves.toEqual(order);
      expect(deps.ordersMock.findById).toHaveBeenCalledWith("t1", "ord1");
    });

    it("throws NotFoundError when the order is missing", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(null);
      const service = createService(deps);

      await expect(service.get("t1", "missing")).rejects.toThrow(NotFoundError);
    });
  });

  describe("getByNumber", () => {
    it("returns an order by number", async () => {
      const deps = createDependencies();
      deps.ordersMock.findByNumber.mockResolvedValue(order);
      const service = createService(deps);

      await expect(service.getByNumber("t1", "ORD-ABC123")).resolves.toEqual(order);
    });

    it("throws NotFoundError when no order matches", async () => {
      const deps = createDependencies();
      deps.ordersMock.findByNumber.mockResolvedValue(null);
      const service = createService(deps);

      await expect(service.getByNumber("t1", "ORD-UNKNOWN")).rejects.toThrow(NotFoundError);
    });
  });

  describe("list", () => {
    it("delegates to the repository", async () => {
      const deps = createDependencies();
      const result = { items: [order], total: 1, page: 1, pageSize: 20 };
      deps.ordersMock.list.mockResolvedValue(result);
      const service = createService(deps);

      await expect(service.list("t1", { status: "PENDING" })).resolves.toEqual(result);
      expect(deps.ordersMock.list).toHaveBeenCalledWith("t1", { status: "PENDING" });
    });
  });

  describe("createFromCart", () => {
    it("creates an order from a cart with generated order number and prices it", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue(filledCart);
      deps.cartsMock.priceCart.mockResolvedValue(pricingResult);
      deps.productsMock.findById.mockResolvedValue(product);
      deps.ordersMock.findByNumber.mockResolvedValue(null);
      deps.ordersMock.create.mockResolvedValue(order);
      const service = createService(deps);

      const result = await service.createFromCart("t1", {
        cartId: "cart1",
        email: "buyer@example.com",
        address: addressInput,
        shippingCost: 500,
      });

      expect(result).toEqual(order);
      expect(deps.ordersMock.create).toHaveBeenCalledWith(
        "t1",
        expect.objectContaining({
          orderNumber: expect.stringMatching(/^ORD-[A-Z0-9]+$/),
          userId: null,
          email: "buyer@example.com",
          subtotal: 5998,
          discountAmount: 0,
          shippingCost: 500,
          tax: 0,
          total: 6498,
          currency: "usd",
          items: [
            expect.objectContaining({
              productId: "p1",
              variantId: null,
              name: "Anime Figurine",
              price: 2999,
              quantity: 2,
              image: "https://cdn.example.com/img.jpg",
            }),
          ],
          address: expect.objectContaining({ line1: "1 Main St", country: "US" }),
        }),
      );
    });

    it("uses the pricing line unit price for variant items", async () => {
      const deps = createDependencies();
      const variantCart: Cart = {
        ...emptyCart,
        items: [cartItem("ci2", "p2", "v1", 1)],
      };
      const variantPricing = {
        currency: "usd",
        lines: [{ id: "ci2", unitPrice: 1500, quantity: 1, lineTotal: 1500, tax: 0 }],
        breakdown: { currency: "usd", subtotal: 1500, discountAmount: 0, shippingCost: 0, tax: 0, total: 1500 },
        appliedCoupon: null,
      };
      deps.cartsMock.get.mockResolvedValue(variantCart);
      deps.cartsMock.priceCart.mockResolvedValue(variantPricing);
      deps.productsMock.findById.mockResolvedValue(variantProduct);
      deps.ordersMock.findByNumber.mockResolvedValue(null);
      deps.ordersMock.create.mockResolvedValue(order);
      const service = createService(deps);

      await service.createFromCart("t1", {
        cartId: "cart1",
        email: "buyer@example.com",
        address: addressInput,
      });

      expect(deps.ordersMock.create).toHaveBeenCalledWith(
        "t1",
        expect.objectContaining({
          items: [
            expect.objectContaining({ productId: "p2", variantId: "v1", price: 1500 }),
          ],
        }),
      );
    });

    it("rejects when the email is empty", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue(filledCart);
      const service = createService(deps);

      await expect(
        service.createFromCart("t1", {
          cartId: "cart1",
          email: "",
          address: addressInput,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects when the address is incomplete", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue(filledCart);
      const service = createService(deps);

      await expect(
        service.createFromCart("t1", {
          cartId: "cart1",
          email: "buyer@example.com",
          address: { line1: "", city: "", state: "", postalCode: "", country: "US" },
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects an empty cart", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue(emptyCart);
      const service = createService(deps);

      await expect(
        service.createFromCart("t1", {
          cartId: "cart1",
          email: "buyer@example.com",
          address: addressInput,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects when the cart is missing", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockRejectedValue(new NotFoundError("Cart cart1 not found"));
      const service = createService(deps);

      await expect(
        service.createFromCart("t1", {
          cartId: "cart1",
          email: "buyer@example.com",
          address: addressInput,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("rejects when the pricing engine reports a coupon error", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue(filledCart);
      deps.cartsMock.priceCart.mockResolvedValue({
        ...pricingResult,
        couponError: "Coupon SAVE10 requires a minimum order amount of 10000",
      });
      const service = createService(deps);

      await expect(
        service.createFromCart("t1", {
          cartId: "cart1",
          email: "buyer@example.com",
          address: addressInput,
          coupon: { code: "SAVE10", type: "PERCENTAGE", value: 10 },
        }),
      ).rejects.toThrow(ValidationError);
      expect(deps.ordersMock.create).not.toHaveBeenCalled();
    });

    it("rejects an unpublished product", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue(filledCart);
      deps.cartsMock.priceCart.mockResolvedValue(pricingResult);
      deps.productsMock.findById.mockResolvedValue(unpublishedProduct);
      const service = createService(deps);

      await expect(
        service.createFromCart("t1", {
          cartId: "cart1",
          email: "buyer@example.com",
          address: addressInput,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("rejects a missing variant", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue({
        ...emptyCart,
        items: [cartItem("ci2", "p2", "nope", 1)],
      });
      deps.cartsMock.priceCart.mockResolvedValue(pricingResult);
      deps.productsMock.findById.mockResolvedValue(variantProduct);
      const service = createService(deps);

      await expect(
        service.createFromCart("t1", {
          cartId: "cart1",
          email: "buyer@example.com",
          address: addressInput,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it("rejects an inactive variant", async () => {
      const deps = createDependencies();
      const inactiveVariantProduct: Product = {
        ...variantProduct,
        variants: [
          {
            ...variantProduct.variants[0]!,
            isActive: false,
          },
        ],
      };
      deps.cartsMock.get.mockResolvedValue({
        ...emptyCart,
        items: [cartItem("ci2", "p2", "v1", 1)],
      });
      deps.cartsMock.priceCart.mockResolvedValue(pricingResult);
      deps.productsMock.findById.mockResolvedValue(inactiveVariantProduct);
      const service = createService(deps);

      await expect(
        service.createFromCart("t1", {
          cartId: "cart1",
          email: "buyer@example.com",
          address: addressInput,
        }),
      ).rejects.toThrow(ValidationError);
    });

    it("decrements stock for every cart item after creation", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue(filledCart);
      deps.cartsMock.priceCart.mockResolvedValue(pricingResult);
      deps.productsMock.findById.mockResolvedValue(product);
      deps.ordersMock.findByNumber.mockResolvedValue(null);
      deps.ordersMock.create.mockResolvedValue(order);
      const service = createService(deps);

      await service.createFromCart("t1", {
        cartId: "cart1",
        email: "buyer@example.com",
        address: addressInput,
      });

      expect(deps.productServiceMock.adjustStock).toHaveBeenCalledWith("t1", "p1", -2);
    });

    it("honors an explicit order number override", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue(filledCart);
      deps.cartsMock.priceCart.mockResolvedValue(pricingResult);
      deps.productsMock.findById.mockResolvedValue(product);
      deps.ordersMock.findByNumber.mockResolvedValue(null);
      deps.ordersMock.create.mockResolvedValue(order);
      const service = createService(deps);

      await service.createFromCart("t1", {
        cartId: "cart1",
        email: "buyer@example.com",
        address: addressInput,
        orderNumber: "CUSTOM-1",
      });

      expect(deps.ordersMock.create).toHaveBeenCalledWith(
        "t1",
        expect.objectContaining({ orderNumber: "CUSTOM-1" }),
      );
    });

    it("rejects a duplicate order number override", async () => {
      const deps = createDependencies();
      deps.cartsMock.get.mockResolvedValue(filledCart);
      deps.cartsMock.priceCart.mockResolvedValue(pricingResult);
      deps.productsMock.findById.mockResolvedValue(product);
      deps.ordersMock.findByNumber.mockResolvedValue(order);
      const service = createService(deps);

      await expect(
        service.createFromCart("t1", {
          cartId: "cart1",
          email: "buyer@example.com",
          address: addressInput,
          orderNumber: "ORD-ABC123",
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe("update", () => {
    it("delegates to the repository", async () => {
      const deps = createDependencies();
      const updated: Order = { ...order, email: "new@example.com" };
      deps.ordersMock.update.mockResolvedValue(updated);
      const service = createService(deps);

      await expect(
        service.update("t1", "ord1", { email: "new@example.com" }),
      ).resolves.toEqual(updated);
      expect(deps.ordersMock.update).toHaveBeenCalledWith("t1", "ord1", {
        email: "new@example.com",
      });
    });
  });

  describe("transition", () => {
    it("returns the order unchanged when the status does not change", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      const service = createService(deps);

      await expect(service.transition("t1", "ord1", "PENDING")).resolves.toEqual(order);
      expect(deps.ordersMock.update).not.toHaveBeenCalled();
    });

    it("moves PENDING to CONFIRMED and stamps paidAt", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      const paid: Order = { ...order, status: "CONFIRMED", paidAt: new Date("2026-01-02T00:00:00Z") };
      deps.ordersMock.update.mockResolvedValue(paid);
      const service = createService(deps);

      await expect(service.transition("t1", "ord1", "CONFIRMED")).resolves.toEqual(paid);
      expect(deps.ordersMock.update).toHaveBeenCalledWith(
        "t1",
        "ord1",
        expect.objectContaining({ status: "CONFIRMED", paidAt: expect.any(Date) }),
      );
    });

    it("moves CONFIRMED to SHIPPED and stamps shippedAt and trackingNumber", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(confirmedOrder);
      const shipped: Order = {
        ...confirmedOrder,
        status: "SHIPPED",
        trackingNumber: "TRK123",
        shippedAt: new Date("2026-01-03T00:00:00Z"),
      };
      deps.ordersMock.update.mockResolvedValue(shipped);
      const service = createService(deps);

      await expect(
        service.transition("t1", "ord1", "SHIPPED", { trackingNumber: "TRK123" }),
      ).resolves.toEqual(shipped);
      expect(deps.ordersMock.update).toHaveBeenCalledWith(
        "t1",
        "ord1",
        expect.objectContaining({ status: "SHIPPED", trackingNumber: "TRK123" }),
      );
    });

    it("stamps deliveredAt and cancelledAt on their transitions", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue({ ...confirmedOrder, status: "SHIPPED" });
      deps.ordersMock.update.mockImplementation((_t, _id, input) =>
        Promise.resolve({ ...confirmedOrder, ...input }),
      );
      const service = createService(deps);

      await service.transition("t1", "ord1", "DELIVERED");
      expect(deps.ordersMock.update).toHaveBeenLastCalledWith(
        "t1",
        "ord1",
        expect.objectContaining({ status: "DELIVERED", deliveredAt: expect.any(Date) }),
      );

      deps.ordersMock.update.mockClear();
      deps.ordersMock.findById.mockResolvedValue(confirmedOrder);
      await service.transition("t1", "ord1", "CANCELLED");
      expect(deps.ordersMock.update).toHaveBeenLastCalledWith(
        "t1",
        "ord1",
        expect.objectContaining({ status: "CANCELLED", cancelledAt: expect.any(Date) }),
      );
    });

    it("rejects an invalid transition", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      const service = createService(deps);

      await expect(service.transition("t1", "ord1", "DELIVERED")).rejects.toThrow(
        ValidationError,
      );
      expect(deps.ordersMock.update).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when the order is missing", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(null);
      const service = createService(deps);

      await expect(service.transition("t1", "missing", "CONFIRMED")).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe("convenience transitions", () => {
    it("marks an order paid", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      const paid: Order = { ...order, status: "CONFIRMED", paidAt: new Date() };
      deps.ordersMock.update.mockResolvedValue(paid);
      const service = createService(deps);

      await expect(service.markPaid("t1", "ord1")).resolves.toEqual(paid);
    });

    it("marks an order shipped with a tracking number", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(confirmedOrder);
      const shipped: Order = { ...confirmedOrder, status: "SHIPPED", trackingNumber: "TRK1" };
      deps.ordersMock.update.mockResolvedValue(shipped);
      const service = createService(deps);

      await expect(service.markShipped("t1", "ord1", "TRK1")).resolves.toEqual(shipped);
    });

    it("marks an order delivered", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue({ ...confirmedOrder, status: "SHIPPED" });
      const delivered: Order = { ...confirmedOrder, status: "DELIVERED", deliveredAt: new Date() };
      deps.ordersMock.update.mockResolvedValue(delivered);
      const service = createService(deps);

      await expect(service.markDelivered("t1", "ord1")).resolves.toEqual(delivered);
    });

    it("cancels an order", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      const cancelled: Order = { ...order, status: "CANCELLED", cancelledAt: new Date() };
      deps.ordersMock.update.mockResolvedValue(cancelled);
      const service = createService(deps);

      await expect(service.cancel("t1", "ord1")).resolves.toEqual(cancelled);
    });

    it("refunds a confirmed order", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(confirmedOrder);
      const refunded: Order = { ...confirmedOrder, status: "REFUNDED" };
      deps.ordersMock.update.mockResolvedValue(refunded);
      const service = createService(deps);

      await expect(service.refund("t1", "ord1")).resolves.toEqual(refunded);
    });
  });

  describe("createPayment", () => {
    it("creates a payment for the order total and marks the order paid on authorization", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      deps.ordersMock.update.mockResolvedValue({ ...order, status: "CONFIRMED", paidAt: new Date() });
      deps.paymentMock.createPayment.mockResolvedValue({
        success: true,
        paymentId: "pay_1",
        status: PaymentStatus.Authorized,
      });
      const service = createService(deps);

      const result = await service.createPayment("t1", "ord1");

      expect(result).toEqual({
        success: true,
        paymentId: "pay_1",
        status: PaymentStatus.Authorized,
      });
      expect(deps.paymentMock.createPayment).toHaveBeenCalledWith({
        amount: { amount: 6498, currency: "usd" },
        currency: "usd",
        reference: "ORD-ABC123",
        description: "Order ORD-ABC123",
        customer: { email: "buyer@example.com" },
        metadata: { orderId: "ord1" },
      });
      expect(deps.ordersMock.update).toHaveBeenCalledWith(
        "t1",
        "ord1",
        expect.objectContaining({ status: "CONFIRMED" }),
      );
    });

    it("does not mark the order paid when payment fails", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      deps.paymentMock.createPayment.mockResolvedValue({
        success: false,
        paymentId: "pay_1",
        status: PaymentStatus.Failed,
        error: { code: "card_declined", message: "Card declined" },
      });
      const service = createService(deps);

      const result = await service.createPayment("t1", "ord1");

      expect(result.success).toBe(false);
      expect(deps.ordersMock.update).not.toHaveBeenCalled();
    });
  });

  describe("capturePayment", () => {
    it("marks the order paid when capture succeeds", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      deps.ordersMock.update.mockResolvedValue({ ...order, status: "CONFIRMED", paidAt: new Date() });
      deps.paymentMock.capturePayment.mockResolvedValue({
        success: true,
        paymentId: "pay_1",
        status: PaymentStatus.Captured,
      });
      const service = createService(deps);

      await service.capturePayment("t1", "ord1", "pay_1");

      expect(deps.paymentMock.capturePayment).toHaveBeenCalledWith("pay_1");
      expect(deps.ordersMock.update).toHaveBeenCalledWith(
        "t1",
        "ord1",
        expect.objectContaining({ status: "CONFIRMED" }),
      );
    });

    it("does not mark the order paid when capture fails", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      deps.paymentMock.capturePayment.mockResolvedValue({
        success: false,
        paymentId: "pay_1",
        status: PaymentStatus.Failed,
      });
      const service = createService(deps);

      const result = await service.capturePayment("t1", "ord1", "pay_1");

      expect(result.success).toBe(false);
      expect(deps.ordersMock.update).not.toHaveBeenCalled();
    });
  });

  describe("refundPayment", () => {
    it("refunds a confirmed order through the provider", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(confirmedOrder);
      deps.ordersMock.update.mockResolvedValue({ ...confirmedOrder, status: "REFUNDED" });
      deps.paymentMock.refundPayment.mockResolvedValue({
        success: true,
        paymentId: "pay_1",
        status: PaymentStatus.Refunded,
      });
      const service = createService(deps);

      await service.refundPayment("t1", "ord1", "pay_1");

      expect(deps.paymentMock.refundPayment).toHaveBeenCalledWith("pay_1");
      expect(deps.ordersMock.update).toHaveBeenCalledWith(
        "t1",
        "ord1",
        expect.objectContaining({ status: "REFUNDED" }),
      );
    });

    it("rejects when the order is already refunded", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue({ ...confirmedOrder, status: "REFUNDED" });
      const service = createService(deps);

      await expect(service.refundPayment("t1", "ord1", "pay_1")).rejects.toThrow(
        ConflictError,
      );
      expect(deps.paymentMock.refundPayment).not.toHaveBeenCalled();
    });

    it("does not change the order when the refund fails", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(confirmedOrder);
      deps.paymentMock.refundPayment.mockResolvedValue({
        success: false,
        paymentId: "pay_1",
        status: PaymentStatus.Failed,
      });
      const service = createService(deps);

      const result = await service.refundPayment("t1", "ord1", "pay_1");

      expect(result.success).toBe(false);
      expect(deps.ordersMock.update).not.toHaveBeenCalled();
    });
  });

  describe("calculateTax", () => {
    it("calculates tax from the order address and items", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(orderWithAddress);
      const calculation = {
        success: true,
        lines: [
          { id: "oi1", amount: { amount: 300, currency: "usd" }, rate: 5, taxType: "SALES" },
        ],
        totalTax: { amount: 300, currency: "usd" },
        currency: "usd",
      };
      deps.taxMock.calculate.mockResolvedValue(calculation);
      const service = createService(deps);

      const result = await service.calculateTax("t1", "ord1");

      expect(result).toEqual(calculation);
      expect(deps.taxMock.calculate).toHaveBeenCalledWith({
        toAddress: {
          countryCode: "US",
          postalCode: "62701",
          region: "IL",
          city: "Springfield",
        },
        currency: "usd",
        lines: [
          { id: "oi1", amount: { amount: 5998, currency: "usd" }, quantity: 2 },
        ],
      });
    });

    it("rejects an order without a shipping address", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      const service = createService(deps);

      await expect(service.calculateTax("t1", "ord1")).rejects.toThrow(ValidationError);
      expect(deps.taxMock.calculate).not.toHaveBeenCalled();
    });
  });

  describe("priceOrder", () => {
    it("delegates to the cart pricing flow", async () => {
      const deps = createDependencies();
      deps.cartsMock.priceCart.mockResolvedValue(pricingResult);
      const service = createService(deps);

      const result = await service.priceOrder("t1", {
        cartId: "cart1",
        email: "buyer@example.com",
        address: addressInput,
        coupon: { code: "SAVE10", type: "PERCENTAGE", value: 10 },
      });

      expect(result).toEqual(pricingResult);
      expect(deps.cartsMock.priceCart).toHaveBeenCalledWith("t1", "cart1", {
        currency: "usd",
        coupon: { code: "SAVE10", type: "PERCENTAGE", value: 10 },
        shippingCost: undefined,
        taxRate: undefined,
        taxRates: undefined,
      });
    });
  });

  describe("getShippingRates", () => {
    it("fetches rates using order totals and provided dimensions", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      const rates = [
        {
          id: "rate1",
          carrier: "UPS",
          service: "Ground",
          price: { amount: 500, currency: "usd" },
          estimatedDaysMin: 2,
          estimatedDaysMax: 5,
        },
      ];
      deps.shippingMock.getRates.mockResolvedValue(rates);
      const service = createService(deps);

      const result = await service.getShippingRates("t1", {
        orderId: "ord1",
        fromPostalCode: "90210",
        toAddress: { country: "US", postalCode: "62701" },
        dimensions: { weightKg: 1, lengthCm: 20, widthCm: 10, heightCm: 5 },
      });

      expect(result).toEqual(rates);
      expect(deps.shippingMock.getRates).toHaveBeenCalledWith({
        fromPostalCode: "90210",
        toAddress: { country: "US", postalCode: "62701" },
        dimensions: { weightKg: 1, lengthCm: 20, widthCm: 10, heightCm: 5 },
        declaredValue: { amount: 6498, currency: "usd" },
        items: [{ quantity: 2, price: { amount: 2999, currency: "usd" } }],
      });
    });

    it("derives dimensions from products when none are provided", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      deps.productsMock.findById.mockResolvedValue(product);
      deps.shippingMock.getRates.mockResolvedValue([]);
      const service = createService(deps);

      await service.getShippingRates("t1", {
        orderId: "ord1",
        fromPostalCode: "90210",
        toAddress: { country: "US" },
      });

      expect(deps.shippingMock.getRates).toHaveBeenCalledWith(
        expect.objectContaining({
          dimensions: { weightKg: 1, lengthCm: 20, widthCm: 10, heightCm: 5 },
        }),
      );
    });

    it("rejects an order without items", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue({ ...order, items: [] });
      const service = createService(deps);

      await expect(
        service.getShippingRates("t1", {
          orderId: "ord1",
          fromPostalCode: "90210",
          toAddress: { country: "US" },
        }),
      ).rejects.toThrow(ValidationError);
    });
  });

  describe("createLabel", () => {
    it("creates a label and marks the order shipped", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(confirmedOrderWithAddress);
      deps.productsMock.findById.mockResolvedValue(product);
      const label = {
        trackingNumber: "TRK123",
        labelUrl: "https://cdn.example.com/label.pdf",
        labelFormat: "pdf",
        carrier: "UPS",
        service: "Ground",
      };
      deps.shippingMock.createLabel.mockResolvedValue(label);
      deps.ordersMock.update.mockResolvedValue({ ...orderWithAddress, status: "SHIPPED" });
      const service = createService(deps);

      const result = await service.createLabel("t1", "ord1", {
        rate: {
          id: "rate1",
          carrier: "UPS",
          service: "Ground",
          price: { amount: 500, currency: "usd" },
          currency: "usd",
          estimatedDaysMin: 2,
          estimatedDaysMax: 5,
        },
        fromPostalCode: "90210",
      });

      expect(result).toEqual(label);
      expect(deps.shippingMock.createLabel).toHaveBeenCalledWith({
        shipmentId: "ord1",
        rate: expect.objectContaining({ id: "rate1", carrier: "UPS" }),
        toAddress: {
          addressLine1: "1 Main St",
          addressLine2: undefined,
          city: "Springfield",
          region: "IL",
          postalCode: "62701",
          country: "US",
        },
        fromPostalCode: "90210",
        dimensions: { weightKg: 1, lengthCm: 20, widthCm: 10, heightCm: 5 },
      });
      expect(deps.ordersMock.update).toHaveBeenCalledWith(
        "t1",
        "ord1",
        expect.objectContaining({
          status: "SHIPPED",
          trackingNumber: "TRK123",
          shippedAt: expect.any(Date),
        }),
      );
    });

    it("rejects an order without a shipping address", async () => {
      const deps = createDependencies();
      deps.ordersMock.findById.mockResolvedValue(order);
      const service = createService(deps);

      await expect(
        service.createLabel("t1", "ord1", {
          rate: {
            id: "rate1",
            carrier: "UPS",
            service: "Ground",
            price: { amount: 500, currency: "usd" },
            currency: "usd",
            estimatedDaysMin: 2,
            estimatedDaysMax: 5,
          },
          fromPostalCode: "90210",
        }),
      ).rejects.toThrow(ValidationError);
      expect(deps.shippingMock.createLabel).not.toHaveBeenCalled();
    });
  });
});

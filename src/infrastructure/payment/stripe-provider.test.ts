import { describe, expect, it, vi, beforeEach } from "vitest";
import { StripeProvider } from "./stripe-provider";
import { PaymentStatus } from "@/core/payment/payment-provider.interface";
import type { PaymentRequest } from "@/core/payment/payment-provider.interface";

const mockCreate = vi.fn();
const mockCapture = vi.fn();
const mockRefundCreate = vi.fn();

vi.mock("stripe", () => {
  class MockStripe {
    paymentIntents = {
      create: mockCreate,
      capture: mockCapture,
    };
    refunds = {
      create: mockRefundCreate,
    };
  }
  return { default: MockStripe };
});

const request: PaymentRequest = {
  amount: { amount: 1000, currency: "usd" },
  currency: "usd",
  reference: "order_123",
  description: "Test order",
  customer: { email: "buyer@example.com" },
};

describe("StripeProvider", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockCapture.mockReset();
    mockRefundCreate.mockReset();
  });

  it("implements the PaymentProvider contract", () => {
    const provider = new StripeProvider({ enabled: true, secretKey: "sk_test_123", currency: "usd" });
    expect(provider.id).toBe("stripe");
    expect(provider.name).toBe("Stripe");
    for (const method of ["createPayment", "capturePayment", "refundPayment", "handleWebhook"]) {
      expect(typeof (provider as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("creates a payment and maps Stripe status to Captured", async () => {
    mockCreate.mockResolvedValue({ id: "pi_123", status: "succeeded", client_secret: "cs_secret" });
    const provider = new StripeProvider({ enabled: true, secretKey: "sk_test_123", currency: "usd" });

    const result = await provider.createPayment(request);

    expect(result.success).toBe(true);
    expect(result.paymentId).toBe("pi_123");
    expect(result.status).toBe(PaymentStatus.Captured);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 1000, currency: "usd", metadata: { reference: "order_123" } }),
    );
  });

  it("returns a failed result with error details on Stripe errors", async () => {
    mockCreate.mockRejectedValue({ type: "card_error", code: "card_declined", message: "Card declined" });
    const provider = new StripeProvider({ enabled: true, secretKey: "sk_test_123", currency: "usd" });

    const result = await provider.createPayment(request);

    expect(result.success).toBe(false);
    expect(result.status).toBe(PaymentStatus.Failed);
    expect(result.error).toEqual({ code: "card_declined", message: "Card declined" });
  });

  it("captures a payment with an optional amount", async () => {
    mockCapture.mockResolvedValue({ id: "pi_123", status: "succeeded" });
    const provider = new StripeProvider({ enabled: true, secretKey: "sk_test_123", currency: "usd" });

    const result = await provider.capturePayment("pi_123", { amount: 500, currency: "usd" });

    expect(result.success).toBe(true);
    expect(result.status).toBe(PaymentStatus.Captured);
    expect(mockCapture).toHaveBeenCalledWith("pi_123", { amount_to_capture: 500 });
  });

  it("refunds a payment", async () => {
    mockRefundCreate.mockResolvedValue({ id: "re_123", payment_intent: "pi_123" });
    const provider = new StripeProvider({ enabled: true, secretKey: "sk_test_123", currency: "usd" });

    const result = await provider.refundPayment("pi_123");

    expect(result.success).toBe(true);
    expect(result.status).toBe(PaymentStatus.Refunded);
    expect(mockRefundCreate).toHaveBeenCalledWith({ payment_intent: "pi_123" });
  });

  it("handles payment_intent webhooks and maps statuses", async () => {
    const provider = new StripeProvider({ enabled: true, secretKey: "sk_test_123", currency: "usd" });

    const result = await provider.handleWebhook({
      provider: "stripe",
      eventType: "payment_intent.succeeded",
      raw: { type: "payment_intent.succeeded", data: { object: { id: "pi_123", status: "succeeded" } } },
    });

    expect(result.success).toBe(true);
    expect(result.paymentId).toBe("pi_123");
    expect(result.status).toBe(PaymentStatus.Captured);
  });

  it("throws when the provider is disabled", async () => {
    const provider = new StripeProvider({ enabled: false, currency: "usd" });
    await expect(provider.createPayment(request)).rejects.toThrow("disabled");
  });
});

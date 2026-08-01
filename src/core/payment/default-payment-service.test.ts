import { describe, expect, it, vi } from "vitest";
import { DefaultPaymentService } from "./default-payment-service";
import { ValidationError } from "@/shared/errors/platform-error";
import {
  PaymentStatus,
  type PaymentProvider,
  type PaymentRequest,
  type PaymentWebhookPayload,
} from "./payment-provider.interface";

function createDependencies() {
  const payment = {
    id: "test-payment",
    name: "Test Payment",
    createPayment: vi.fn(),
    capturePayment: vi.fn(),
    refundPayment: vi.fn(),
    handleWebhook: vi.fn(),
  };
  return {
    payment: payment as unknown as PaymentProvider,
    paymentMock: payment,
  };
}

function createService(deps: ReturnType<typeof createDependencies>): DefaultPaymentService {
  return new DefaultPaymentService(deps.payment);
}

const validRequest: PaymentRequest = {
  amount: { amount: 2999, currency: "usd" },
  currency: "usd",
  reference: "ORD-TEST-1",
  description: "Order ORD-TEST-1",
  customer: { id: "user-1", email: "buyer@example.com" },
  metadata: { orderId: "order-1" },
};

const successResult = {
  success: true,
  paymentId: "pi_123",
  status: PaymentStatus.Captured,
  raw: { id: "pi_123" },
};

const failureResult = {
  success: false,
  paymentId: "",
  status: PaymentStatus.Failed,
  error: { code: "card_declined", message: "Card was declined" },
};

describe("DefaultPaymentService.createPayment", () => {
  it("delegates to the provider and returns the result unchanged", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.createPayment.mockResolvedValue(successResult);

    const result = await service.createPayment("t1", validRequest);

    expect(deps.paymentMock.createPayment).toHaveBeenCalledTimes(1);
    expect(deps.paymentMock.createPayment).toHaveBeenCalledWith(validRequest);
    expect(result).toBe(successResult);
  });

  it("returns a provider failure as-is without throwing", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.createPayment.mockResolvedValue(failureResult);

    const result = await service.createPayment("t1", validRequest);

    expect(result.success).toBe(false);
    expect(result.status).toBe(PaymentStatus.Failed);
    expect(result.error).toEqual({ code: "card_declined", message: "Card was declined" });
  });

  it.each([
    [{ ...validRequest, amount: { amount: 0, currency: "usd" } }],
    [{ ...validRequest, amount: { amount: -100, currency: "usd" } }],
    [{ ...validRequest, amount: { amount: Number.NaN, currency: "usd" } }],
    [{ ...validRequest, currency: "  " }],
    [{ ...validRequest, reference: "" }],
  ])("rejects invalid input without calling the provider: %o", async (request) => {
    const deps = createDependencies();
    const service = createService(deps);

    await expect(service.createPayment("t1", request)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.paymentMock.createPayment).not.toHaveBeenCalled();
  });
});

describe("DefaultPaymentService.capturePayment", () => {
  it("delegates to the provider and returns the result unchanged", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.capturePayment.mockResolvedValue(successResult);

    const result = await service.capturePayment("t1", "pi_123");

    expect(deps.paymentMock.capturePayment).toHaveBeenCalledWith("pi_123", undefined);
    expect(result).toBe(successResult);
  });

  it("forwards a partial amount when provided", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.capturePayment.mockResolvedValue(successResult);

    await service.capturePayment("t1", "pi_123", { amount: 1000, currency: "usd" });

    expect(deps.paymentMock.capturePayment).toHaveBeenCalledWith("pi_123", {
      amount: 1000,
      currency: "usd",
    });
  });

  it("returns a provider failure as-is without throwing", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.capturePayment.mockResolvedValue(failureResult);

    const result = await service.capturePayment("t1", "pi_123");

    expect(result).toBe(failureResult);
  });

  it.each([
    ["", undefined],
    ["pi_123", { amount: -1, currency: "usd" }],
    ["pi_123", { amount: Number.POSITIVE_INFINITY, currency: "usd" }],
  ])("rejects invalid input without calling the provider: %o", async (paymentId, amount) => {
    const deps = createDependencies();
    const service = createService(deps);

    await expect(service.capturePayment("t1", paymentId, amount)).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(deps.paymentMock.capturePayment).not.toHaveBeenCalled();
  });
});

describe("DefaultPaymentService.refundPayment", () => {
  it("delegates to the provider and returns the result unchanged", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.refundPayment.mockResolvedValue(successResult);

    const result = await service.refundPayment("t1", "pi_123");

    expect(deps.paymentMock.refundPayment).toHaveBeenCalledWith("pi_123", undefined);
    expect(result).toBe(successResult);
  });

  it("forwards a partial amount when provided", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.refundPayment.mockResolvedValue(successResult);

    await service.refundPayment("t1", "pi_123", { amount: 500, currency: "usd" });

    expect(deps.paymentMock.refundPayment).toHaveBeenCalledWith("pi_123", {
      amount: 500,
      currency: "usd",
    });
  });

  it("returns a provider failure as-is without throwing", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.refundPayment.mockResolvedValue(failureResult);

    const result = await service.refundPayment("t1", "pi_123");

    expect(result).toBe(failureResult);
  });

  it.each([
    ["", undefined],
    ["pi_123", { amount: 0, currency: "usd" }],
  ])("rejects invalid input without calling the provider: %o", async (paymentId, amount) => {
    const deps = createDependencies();
    const service = createService(deps);

    await expect(service.refundPayment("t1", paymentId, amount)).rejects.toBeInstanceOf(
      ValidationError,
    );
    expect(deps.paymentMock.refundPayment).not.toHaveBeenCalled();
  });
});

describe("DefaultPaymentService.handleWebhook", () => {
  const payload: PaymentWebhookPayload = {
    provider: "stripe",
    eventType: "payment_intent.succeeded",
    paymentId: "pi_123",
    signature: "sig",
    raw: { id: "evt_1", type: "payment_intent.succeeded", data: { object: { id: "pi_123" } } },
  };

  const webhookResult = { success: true, status: PaymentStatus.Captured, paymentId: "pi_123" };

  it("delegates the payload unchanged to the provider and returns the result unchanged", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.handleWebhook.mockResolvedValue(webhookResult);

    const result = await service.handleWebhook("t1", payload);

    expect(deps.paymentMock.handleWebhook).toHaveBeenCalledTimes(1);
    expect(deps.paymentMock.handleWebhook).toHaveBeenCalledWith(payload);
    expect(result).toBe(webhookResult);
  });

  it("does not perform signature verification in the service", async () => {
    const deps = createDependencies();
    const service = createService(deps);
    deps.paymentMock.handleWebhook.mockResolvedValue(webhookResult);

    await service.handleWebhook("t1", payload);

    expect(deps.paymentMock.handleWebhook).toHaveBeenCalledWith(payload);
  });

  it.each([
    [{ ...payload, provider: "" }],
    [{ ...payload, eventType: "  " }],
    [{ ...payload, raw: undefined }],
    [{ ...payload, raw: null }],
  ])("rejects invalid input without calling the provider: %o", async (invalid) => {
    const deps = createDependencies();
    const service = createService(deps);

    await expect(service.handleWebhook("t1", invalid)).rejects.toBeInstanceOf(ValidationError);
    expect(deps.paymentMock.handleWebhook).not.toHaveBeenCalled();
  });
});

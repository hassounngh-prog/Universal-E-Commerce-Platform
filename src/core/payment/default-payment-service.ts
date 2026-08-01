import { ValidationError } from "@/shared/errors/platform-error";
import type { Money } from "@/shared/types";
import type { PaymentProvider } from "./payment-provider.interface";
import type { PaymentService } from "./payment-service.interface";
import type {
  PaymentRequest,
  PaymentResult,
  PaymentWebhookPayload,
  PaymentWebhookResult,
} from "./payment-provider.interface";

export class DefaultPaymentService implements PaymentService {
  constructor(private readonly payment: PaymentProvider) {}

  async createPayment(tenantId: string | null, request: PaymentRequest): Promise<PaymentResult> {
    this.requirePositiveAmount(request.amount, "amount");
    this.requireValue(request.currency, "currency");
    this.requireValue(request.reference, "reference");
    return this.payment.createPayment(request);
  }

  async capturePayment(
    tenantId: string | null,
    paymentId: string,
    amount?: Money,
  ): Promise<PaymentResult> {
    this.requireValue(paymentId, "paymentId");
    if (amount !== undefined) {
      this.requirePositiveAmount(amount, "amount");
    }
    return this.payment.capturePayment(paymentId, amount);
  }

  async refundPayment(
    tenantId: string | null,
    paymentId: string,
    amount?: Money,
  ): Promise<PaymentResult> {
    this.requireValue(paymentId, "paymentId");
    if (amount !== undefined) {
      this.requirePositiveAmount(amount, "amount");
    }
    return this.payment.refundPayment(paymentId, amount);
  }

  async handleWebhook(
    tenantId: string | null,
    payload: PaymentWebhookPayload,
  ): Promise<PaymentWebhookResult> {
    this.requireValue(payload.provider, "provider");
    this.requireValue(payload.eventType, "eventType");
    if (payload.raw === undefined || payload.raw === null) {
      throw new ValidationError("raw is required");
    }
    return this.payment.handleWebhook(payload);
  }

  private requirePositiveAmount(amount: Money, label: string): void {
    if (
      typeof amount.amount !== "number" ||
      !Number.isFinite(amount.amount) ||
      amount.amount <= 0
    ) {
      throw new ValidationError(`${label}.amount must be a positive number`);
    }
    this.requireValue(amount.currency, `${label}.currency`);
  }

  private requireValue(value: string, label: string): void {
    if (typeof value !== "string" || value.trim().length === 0) {
      throw new ValidationError(`${label} is required`);
    }
  }
}

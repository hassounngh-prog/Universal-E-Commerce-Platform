import Stripe from "stripe";
import type { Money } from "../../shared/types";
import type { PaymentProviderSettings } from "../../shared/types/provider-settings";
import {
  type PaymentProvider,
  type PaymentRequest,
  type PaymentResult,
  PaymentStatus,
  type PaymentWebhookPayload,
  type PaymentWebhookResult,
} from "../../core/payment/payment-provider.interface";

export class StripeProvider implements PaymentProvider {
  readonly id = "stripe";
  readonly name = "Stripe";

  private client: Stripe | null = null;
  private readonly settings: PaymentProviderSettings;

  constructor(settings: PaymentProviderSettings) {
    this.settings = settings;
  }

  private getClient(): Stripe {
    if (!this.client) {
      if (!this.settings.enabled) {
        throw new Error("[Payment] Stripe provider is disabled (STRIPE_SECRET_KEY missing)");
      }
      if (!this.settings.secretKey) {
        throw new Error("[Payment] STRIPE_SECRET_KEY is required");
      }
      this.client = new Stripe(this.settings.secretKey);
    }
    return this.client;
  }

  async createPayment(request: PaymentRequest): Promise<PaymentResult> {
    const stripe = this.getClient();
    const amount = Math.round(request.amount.amount);
    const currency = request.currency.toLowerCase();

    try {
      const intent = await stripe.paymentIntents.create({
        amount,
        currency,
        description: request.description,
        metadata: {
          reference: request.reference,
          ...this.toStringMap(request.metadata),
        },
        ...(request.customer?.email
          ? { receipt_email: request.customer.email }
          : {}),
      });

      return {
        success: true,
        paymentId: intent.id,
        status: this.mapStatus(intent.status),
        raw: { clientSecret: intent.client_secret },
      };
    } catch (error) {
      return this.toErrorResult(error);
    }
  }

  async capturePayment(paymentId: string, amount?: Money): Promise<PaymentResult> {
    const stripe = this.getClient();

    try {
      const intent = await stripe.paymentIntents.capture(paymentId, {
        ...(amount ? { amount_to_capture: Math.round(amount.amount) } : {}),
      });

      return {
        success: true,
        paymentId: intent.id,
        status: this.mapStatus(intent.status),
        raw: intent,
      };
    } catch (error) {
      return this.toErrorResult(error);
    }
  }

  async refundPayment(paymentId: string, amount?: Money): Promise<PaymentResult> {
    const stripe = this.getClient();

    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentId,
        ...(amount ? { amount: Math.round(amount.amount) } : {}),
      });

      return {
        success: true,
        paymentId: refund.payment_intent as string,
        status: PaymentStatus.Refunded,
        raw: refund,
      };
    } catch (error) {
      return this.toErrorResult(error);
    }
  }

  async handleWebhook(payload: PaymentWebhookPayload): Promise<PaymentWebhookResult> {
    const webhookSecret = this.settings.webhookSecret;

    let rawEvent: unknown;

    if (webhookSecret) {
      if (!payload.signature || typeof payload.raw !== "string") {
        return { success: false, status: null, error: "Invalid webhook signature" };
      }
      try {
        rawEvent = Stripe.webhooks.constructEvent(payload.raw, payload.signature, webhookSecret);
      } catch {
        return { success: false, status: null, error: "Invalid webhook signature" };
      }
    } else {
      rawEvent = payload.raw;
    }

    const raw = rawEvent as { id?: string; type?: string; data?: { object?: unknown } };
    const eventType = payload.eventType ?? raw?.type ?? "";

    if (!eventType.startsWith("payment_intent.")) {
      return { success: true, status: null };
    }

    const object = raw?.data?.object as { id?: string; status?: string } | undefined;
    const paymentId = payload.paymentId ?? object?.id;

    if (!paymentId) {
      return { success: false, status: null, error: "Missing payment id in payload" };
    }

    return {
      success: true,
      paymentId,
      status: this.mapStatus(object?.status ?? ""),
    };
  }

  private mapStatus(stripeStatus: string): PaymentStatus {
    switch (stripeStatus) {
      case "requires_payment_method":
      case "requires_confirmation":
      case "requires_action":
        return PaymentStatus.Pending;
      case "requires_capture":
      case "processing":
        return PaymentStatus.Authorized;
      case "succeeded":
        return PaymentStatus.Captured;
      case "canceled":
        return PaymentStatus.Cancelled;
      case "refunded":
        return PaymentStatus.Refunded;
      default:
        return PaymentStatus.Failed;
    }
  }

  private toStringMap(metadata?: Record<string, unknown>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(metadata ?? {})) {
      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        result[key] = String(value);
      }
    }
    return result;
  }

  private toErrorResult(error: unknown): PaymentResult {
    const stripeError = error as { type?: string; code?: string; message?: string } | undefined;
    return {
      success: false,
      paymentId: "",
      status: PaymentStatus.Failed,
      error: {
        code: stripeError?.code ?? stripeError?.type ?? "payment_error",
        message: stripeError?.message ?? "Unknown payment error",
      },
    };
  }
}

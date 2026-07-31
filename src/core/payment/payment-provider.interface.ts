import type { Money } from "../../shared/types";

export interface PaymentRequest {
  amount: Money;
  currency: string;
  reference: string;
  description?: string;
  customer?: {
    id?: string;
    email?: string;
    name?: string;
  };
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
  status: PaymentStatus;
  raw?: unknown;
  error?: PaymentError;
}

export enum PaymentStatus {
  Pending = "pending",
  Authorized = "authorized",
  Captured = "captured",
  Refunded = "refunded",
  Failed = "failed",
  Cancelled = "cancelled",
}

export interface PaymentError {
  code: string;
  message: string;
}

export interface PaymentWebhookPayload {
  provider: string;
  eventType: string;
  paymentId?: string;
  signature?: string;
  raw: unknown;
}

export interface PaymentWebhookResult {
  success: boolean;
  status: PaymentStatus | null;
  paymentId?: string;
  error?: string;
}

export interface PaymentProvider {
  readonly id: string;
  readonly name: string;

  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  capturePayment(paymentId: string, amount?: Money): Promise<PaymentResult>;
  refundPayment(paymentId: string, amount?: Money): Promise<PaymentResult>;
  handleWebhook(payload: PaymentWebhookPayload): Promise<PaymentWebhookResult>;
}

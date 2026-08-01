import type { Money } from "@/shared/types";
import type {
  PaymentRequest,
  PaymentResult,
  PaymentWebhookPayload,
  PaymentWebhookResult,
} from "./payment-provider.interface";

export interface PaymentService {
  createPayment(tenantId: string | null, request: PaymentRequest): Promise<PaymentResult>;
  capturePayment(
    tenantId: string | null,
    paymentId: string,
    amount?: Money,
  ): Promise<PaymentResult>;
  refundPayment(
    tenantId: string | null,
    paymentId: string,
    amount?: Money,
  ): Promise<PaymentResult>;
  handleWebhook(
    tenantId: string | null,
    payload: PaymentWebhookPayload,
  ): Promise<PaymentWebhookResult>;
}

export interface Money {
  amount: number;
  currency: string;
}

export type CurrencyCode = string;

export interface Address {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export type Result<T, M = Record<string, unknown>> =
  | { success: true; data: T; meta?: M }
  | { success: false; error: ApiError };

export interface ApiEnvelope<T, M = Record<string, unknown>> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: M;
}

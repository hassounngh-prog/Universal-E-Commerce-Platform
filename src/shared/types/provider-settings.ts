export interface PaymentProviderSettings {
  enabled: boolean;
  currency: string;
  secretKey?: string;
  webhookSecret?: string;
}

export interface StorageProviderSettings {
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
  bucket: string;
}

export interface SearchProviderSettings {
  defaultIndex: string;
}

export interface ShippingProviderSettings {
  baseRateCents: number;
  perItemCents: number;
  freeThresholdCents?: number;
  currency: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
}

export interface TaxProviderSettings {
  defaultRate: number;
  currency: string;
}

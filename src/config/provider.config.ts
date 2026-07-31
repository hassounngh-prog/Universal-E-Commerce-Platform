import type {
  PaymentProviderSettings,
  SearchProviderSettings,
  ShippingProviderSettings,
  StorageProviderSettings,
  TaxProviderSettings,
} from "../shared/types/provider-settings";

export interface ProviderConfig {
  payment: {
    provider: string;
    stripe: PaymentProviderSettings;
  };
  storage: {
    provider: string;
    supabase: StorageProviderSettings;
  };
  search: {
    provider: string;
    postgres: SearchProviderSettings;
  };
  shipping: {
    provider: string;
    manual: ShippingProviderSettings;
  };
  tax: {
    provider: string;
    postgres: TaxProviderSettings;
  };
  notification: {
    provider: string;
    console: Record<string, never>;
  };
}

export const providerConfig: ProviderConfig = {
  payment: {
    provider: "stripe",
    stripe: {
      enabled: Boolean(process.env.STRIPE_SECRET_KEY),
      currency: "usd",
      secretKey: process.env.STRIPE_SECRET_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  },
  storage: {
    provider: "supabase",
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      bucket: process.env.SUPABASE_STORAGE_BUCKET ?? "products",
    },
  },
  search: {
    provider: "postgres",
    postgres: {
      defaultIndex: "products",
    },
  },
  shipping: {
    provider: "manual",
    manual: {
      baseRateCents: 500,
      perItemCents: 100,
      freeThresholdCents: 5000,
      currency: "usd",
      estimatedDaysMin: 3,
      estimatedDaysMax: 7,
    },
  },
  tax: {
    provider: "postgres",
    postgres: {
      defaultRate: 0,
      currency: "usd",
    },
  },
  notification: {
    provider: "console",
    console: {},
  },
};

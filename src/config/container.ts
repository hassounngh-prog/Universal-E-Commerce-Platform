import { Container } from "./container-registry";
import { providerConfig } from "./provider.config";
import { StripeProvider } from "@/infrastructure/payment/stripe-provider";
import { SupabaseStorageProvider } from "@/infrastructure/storage/supabase-storage-provider";
import { PostgresSearchProvider } from "@/infrastructure/search/postgres-search-provider";
import { PostgresTaxProvider } from "@/infrastructure/tax/postgres-tax-provider";
import { ManualShippingProvider } from "@/infrastructure/shipping/manual-shipping-provider";
import { ConsoleNotificationChannel } from "@/infrastructure/notification/console-notification-channel";
import type { PaymentProvider } from "@/core/payment/payment-provider.interface";
import type { StorageProvider } from "@/core/storage/storage-provider.interface";
import type { SearchProvider } from "@/core/search/search-provider.interface";
import type { TaxProvider } from "@/core/tax/tax-provider.interface";
import type { ShippingProvider } from "@/core/shipping/shipping-provider.interface";
import type { NotificationChannel } from "@/core/notification/notification-channel.interface";

export const KEYS = {
  payment: "payment.provider",
  storage: "storage.provider",
  search: "search.provider",
  tax: "tax.provider",
  shipping: "shipping.provider",
  notification: "notification.provider",
} as const;

const container = new Container();

container.register<PaymentProvider>(KEYS.payment, () => {
  switch (providerConfig.payment.provider) {
    case "stripe":
      return new StripeProvider(providerConfig.payment.stripe);
    default:
      throw new Error(`[Container] Unknown payment provider: ${providerConfig.payment.provider}`);
  }
});

container.register<StorageProvider>(KEYS.storage, () => {
  switch (providerConfig.storage.provider) {
    case "supabase":
      return new SupabaseStorageProvider(providerConfig.storage.supabase);
    default:
      throw new Error(`[Container] Unknown storage provider: ${providerConfig.storage.provider}`);
  }
});

container.register<SearchProvider>(KEYS.search, () => {
  switch (providerConfig.search.provider) {
    case "postgres":
      return new PostgresSearchProvider(providerConfig.search.postgres);
    default:
      throw new Error(`[Container] Unknown search provider: ${providerConfig.search.provider}`);
  }
});

container.register<TaxProvider>(KEYS.tax, () => {
  switch (providerConfig.tax.provider) {
    case "postgres":
      return new PostgresTaxProvider(providerConfig.tax.postgres);
    default:
      throw new Error(`[Container] Unknown tax provider: ${providerConfig.tax.provider}`);
  }
});

container.register<ShippingProvider>(KEYS.shipping, () => {
  switch (providerConfig.shipping.provider) {
    case "manual":
      return new ManualShippingProvider(providerConfig.shipping.manual);
    default:
      throw new Error(`[Container] Unknown shipping provider: ${providerConfig.shipping.provider}`);
  }
});

container.register<NotificationChannel>(KEYS.notification, () => {
  switch (providerConfig.notification.provider) {
    case "console":
      return new ConsoleNotificationChannel();
    default:
      throw new Error(
        `[Container] Unknown notification provider: ${providerConfig.notification.provider}`,
      );
  }
});

export { container };

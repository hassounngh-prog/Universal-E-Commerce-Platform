import type { Address } from "../shared/types";

export interface TenantConfig {
  id: string;
  name: string;
  domain: string;
  locale: string;
  currency: string;
  countryCode: string;
  address?: Address;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
  };
  payment?: {
    currency: string;
    defaultProviderId?: string;
  };
}

export const defaultTenantConfig: TenantConfig = {
  id: "default",
  name: "CommerceCore",
  domain: "localhost",
  locale: "en",
  currency: "USD",
  countryCode: "US",
};

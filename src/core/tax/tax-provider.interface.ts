import type { Money } from "../../shared/types";

export interface TaxLine {
  id: string;
  amount: Money;
  rate: number;
  taxType: string;
  jurisdiction?: string;
}

export interface TaxRequest {
  toAddress: {
    countryCode: string;
    postalCode?: string;
    region?: string;
    city?: string;
  };
  fromAddress?: {
    countryCode: string;
    postalCode?: string;
    region?: string;
    city?: string;
  };
  currency: string;
  lines: {
    id: string;
    amount: Money;
    productType?: string;
    quantity?: number;
  }[];
  customerTaxCode?: string;
}

export interface TaxCalculation {
  success: boolean;
  lines: TaxLine[];
  totalTax: Money;
  currency: string;
  error?: string;
}

export interface TaxProvider {
  readonly id: string;
  readonly name: string;

  calculate(request: TaxRequest): Promise<TaxCalculation>;
  validateAddress?(address: unknown): Promise<unknown>;
}

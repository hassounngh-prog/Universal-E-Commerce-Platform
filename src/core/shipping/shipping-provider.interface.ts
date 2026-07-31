import type { Money, Address } from "../../shared/types";

export type ShippingAddress = Address;

export interface PackageDimensions {
  weightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
}

export interface ShippingRateInput {
  fromPostalCode: string;
  toAddress: ShippingAddress;
  dimensions: PackageDimensions;
  declaredValue: Money;
  items: { quantity: number; price: Money }[];
}

export interface ShippingRate {
  id: string;
  carrier: string;
  service: string;
  price: Money;
  currency: string;
  estimatedDaysMin: number;
  estimatedDaysMax: number;
  error?: string;
}

export interface ShippingLabelRequest {
  shipmentId: string;
  rate: ShippingRate;
  toAddress: ShippingAddress;
  fromPostalCode: string;
  dimensions: PackageDimensions;
}

export interface ShippingLabel {
  trackingNumber: string;
  labelUrl: string;
  labelFormat: string;
  carrier: string;
  service: string;
}

export interface ShippingProvider {
  readonly id: string;
  readonly name: string;

  getRates(input: ShippingRateInput): Promise<ShippingRate[]>;
  createLabel(request: ShippingLabelRequest): Promise<ShippingLabel>;
  track(trackingNumber: string): Promise<unknown>;
}

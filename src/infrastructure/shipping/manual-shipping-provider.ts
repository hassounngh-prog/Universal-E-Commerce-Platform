import type {
  ShippingLabel,
  ShippingLabelRequest,
  ShippingProvider,
  ShippingRate,
  ShippingRateInput,
} from "../../core/shipping/shipping-provider.interface";
import type { ShippingProviderSettings } from "../../shared/types/provider-settings";

export class ManualShippingProvider implements ShippingProvider {
  readonly id = "manual";
  readonly name = "Manual Shipping";

  private readonly settings: ShippingProviderSettings;

  constructor(settings: ShippingProviderSettings) {
    this.settings = settings;
  }

  async getRates(input: ShippingRateInput): Promise<ShippingRate[]> {
    const totalItems = input.items.reduce((sum, item) => sum + item.quantity, 0);
    const declaredTotal = input.items.reduce(
      (sum, item) => sum + item.price.amount * item.quantity,
      0,
    );
    const freeShipping = this.settings.freeThresholdCents
      ? declaredTotal >= this.settings.freeThresholdCents
      : false;

    const price = freeShipping
      ? 0
      : this.settings.baseRateCents + this.settings.perItemCents * totalItems;

    return [
      {
        id: "manual-standard",
        carrier: "manual",
        service: "Standard",
        price: { amount: price, currency: this.settings.currency },
        currency: this.settings.currency,
        estimatedDaysMin: this.settings.estimatedDaysMin,
        estimatedDaysMax: this.settings.estimatedDaysMax,
      },
      {
        id: "manual-express",
        carrier: "manual",
        service: "Express",
        price: {
          amount: price + 700,
          currency: this.settings.currency,
        },
        currency: this.settings.currency,
        estimatedDaysMin: 1,
        estimatedDaysMax: 2,
      },
    ];
  }

  async createLabel(request: ShippingLabelRequest): Promise<ShippingLabel> {
    const trackingNumber = this.generateTrackingNumber(request.shipmentId);

    return {
      trackingNumber,
      labelUrl: "",
      labelFormat: "pdf",
      carrier: request.rate.carrier,
      service: request.rate.service,
    };
  }

  async track(trackingNumber: string): Promise<unknown> {
    return {
      trackingNumber,
      status: "in_transit",
      events: [],
      provider: this.id,
    };
  }

  private generateTrackingNumber(shipmentId: string): string {
    const seed = shipmentId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8);
    return `MAN-${seed}-${Math.floor(Math.random() * 1_000_000_000)
      .toString()
      .padStart(9, "0")}`;
  }
}

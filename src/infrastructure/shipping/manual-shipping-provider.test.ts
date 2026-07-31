import { describe, expect, it } from "vitest";
import { ManualShippingProvider } from "./manual-shipping-provider";
import type { ShippingRateInput } from "@/core/shipping/shipping-provider.interface";

const settings = {
  baseRateCents: 500,
  perItemCents: 100,
  freeThresholdCents: 5000,
  currency: "usd",
  estimatedDaysMin: 3,
  estimatedDaysMax: 7,
};

const input: ShippingRateInput = {
  fromPostalCode: "10001",
  toAddress: { country: "US", postalCode: "90210", city: "Beverly Hills", region: "CA" },
  dimensions: { weightKg: 1, lengthCm: 30, widthCm: 20, heightCm: 10 },
  declaredValue: { amount: 2500, currency: "usd" },
  items: [{ quantity: 2, price: { amount: 1250, currency: "usd" } }],
};

describe("ManualShippingProvider", () => {
  it("implements the ShippingProvider contract", () => {
    const provider = new ManualShippingProvider(settings);
    expect(provider.id).toBe("manual");
    expect(provider.name).toContain("Manual");
    for (const method of ["getRates", "createLabel", "track"]) {
      expect(typeof (provider as unknown as Record<string, unknown>)[method]).toBe("function");
    }
  });

  it("quotes standard and express rates from base + per-item fees", async () => {
    const provider = new ManualShippingProvider(settings);

    const rates = await provider.getRates(input);

    expect(rates).toHaveLength(2);
    expect(rates[0]).toMatchObject({
      id: "manual-standard",
      service: "Standard",
      price: { amount: 700, currency: "usd" },
      estimatedDaysMin: 3,
      estimatedDaysMax: 7,
    });
    expect(rates[1]).toMatchObject({ service: "Express", price: { amount: 1400, currency: "usd" } });
  });

  it("offers free shipping above the declared threshold", async () => {
    const provider = new ManualShippingProvider(settings);
    const bigInput: ShippingRateInput = {
      ...input,
      items: [{ quantity: 1, price: { amount: 6000, currency: "usd" } }],
    };

    const rates = await provider.getRates(bigInput);

    expect(rates[0]?.price.amount).toBe(0);
  });

  it("creates a label with a MAN- prefixed tracking number", async () => {
    const provider = new ManualShippingProvider(settings);
    const rate = (await provider.getRates(input))[0];
    if (!rate) throw new Error("no rates");

    const label = await provider.createLabel({
      shipmentId: "ship_abc123",
      rate,
      toAddress: input.toAddress,
      fromPostalCode: input.fromPostalCode,
      dimensions: input.dimensions,
    });

    expect(label.trackingNumber).toMatch(/^MAN-[A-Za-z0-9]+-\d{9}$/);
    expect(label.carrier).toBe("manual");
    expect(label.labelFormat).toBe("pdf");
  });

  it("tracks a shipment", async () => {
    const provider = new ManualShippingProvider(settings);

    const result = await provider.track("MAN-ABC-000000001");

    expect(result).toMatchObject({ trackingNumber: "MAN-ABC-000000001", status: "in_transit" });
  });
});

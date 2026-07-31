import { prisma } from "@/shared/lib/prisma";
import type {
  TaxCalculation,
  TaxLine,
  TaxProvider,
  TaxRequest,
} from "../../core/tax/tax-provider.interface";
import type { TaxProviderSettings } from "../../shared/types/provider-settings";

const now = () => new Date();

export class PostgresTaxProvider implements TaxProvider {
  readonly id = "postgres";
  readonly name = "Postgres Tax Table";

  private readonly settings: TaxProviderSettings;

  constructor(settings: TaxProviderSettings) {
    this.settings = settings;
  }

  async calculate(request: TaxRequest): Promise<TaxCalculation> {
    const lines: TaxLine[] = [];
    let compoundBase: number = 0;

    for (const line of request.lines) {
      const rate = await this.lookupRate(request, line.productType);
      if (rate <= 0) {
        continue;
      }

      const simpleAmount = Math.round(line.amount.amount * rate);
      if (simpleAmount > 0) {
        lines.push({
          id: line.id,
          amount: { amount: simpleAmount, currency: request.currency },
          rate,
          taxType: "sales",
          jurisdiction: request.toAddress.countryCode,
        });
        compoundBase += line.amount.amount;
      }
    }

    const compoundRate = await this.lookupCompoundRate(request);
    if (compoundRate > 0 && compoundBase > 0) {
      const amount = Math.round(compoundBase * compoundRate);
      if (amount > 0) {
        lines.push({
          id: "shipping-compound",
          amount: { amount, currency: request.currency },
          rate: compoundRate,
          taxType: "sales",
          jurisdiction: request.toAddress.countryCode,
        });
      }
    }

    const totalTax: number = lines.reduce((sum, line) => sum + line.amount.amount, 0);

    return {
      success: true,
      lines,
      totalTax: { amount: totalTax, currency: request.currency },
      currency: request.currency,
    };
  }

  private async lookupRate(request: TaxRequest, productType?: string): Promise<number> {
    const category = await prisma.taxCategory.findFirst({
      where: productType
        ? { code: productType }
        : { isDefault: true },
    });

    if (!category) {
      return this.settings.defaultRate;
    }

    const record = await prisma.taxRate.findFirst({
      where: {
        categoryId: category.id,
        country: request.toAddress.countryCode,
        ...(request.toAddress.region ? { region: request.toAddress.region } : {}),
        ...(request.toAddress.postalCode
          ? { OR: [{ postalCode: request.toAddress.postalCode }, { postalCode: null }] }
          : {}),
        isCompound: false,
        appliesToShipping: false,
        startsAt: { lte: now() },
        endsAt: { gte: now() },
      },
      orderBy: [{ postalCode: "asc" }, { region: "asc" }, { priority: "desc" }],
    });

    return record ? Number(record.rate) : this.settings.defaultRate;
  }

  private async lookupCompoundRate(request: TaxRequest): Promise<number> {
    const category = await prisma.taxCategory.findFirst({
      where: { isDefault: true },
    });

    if (!category) {
      return 0;
    }

    const record = await prisma.taxRate.findFirst({
      where: {
        categoryId: category.id,
        country: request.toAddress.countryCode,
        ...(request.toAddress.region ? { region: request.toAddress.region } : {}),
        isCompound: true,
        appliesToShipping: false,
        startsAt: { lte: now() },
        endsAt: { gte: now() },
      },
      orderBy: [{ postalCode: "asc" }, { region: "asc" }, { priority: "desc" }],
    });

    return record ? Number(record.rate) : 0;
  }
}

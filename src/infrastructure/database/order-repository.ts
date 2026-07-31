import { Prisma, prisma } from "@/shared/lib/prisma";
import { NotFoundError } from "@/shared/errors/platform-error";
import { toJson, toRecord } from "@/shared/lib/json";
import type { OrderRepository } from "@/core/order/order-repository.interface";
import type {
  CreateOrderInput,
  Order,
  OrderAddress,
  OrderItem,
  OrderListFilter,
  OrderListResult,
  OrderStatus,
  UpdateOrderInput,
} from "@/core/order/types";
import type {
  Order as OrderRow,
  OrderAddress as OrderAddressRow,
  OrderItem as OrderItemRow,
} from "@/generated/prisma/client";

interface OrderWithRelations extends OrderRow {
  items?: OrderItemRow[];
  address?: OrderAddressRow | null;
}

const ORDER_INCLUDE = { items: true, address: true } as const;

function tenantScope(tenantId: string | null): { tenantId: string } | Record<string, never> {
  return tenantId ? { tenantId } : {};
}

function toDomain(row: OrderWithRelations): Order {
  return {
    id: row.id,
    tenantId: row.tenantId,
    orderNumber: row.orderNumber,
    userId: row.userId,
    email: row.email,
    status: row.status as OrderStatus,
    subtotal: row.subtotal,
    discountAmount: row.discountAmount,
    shippingCost: row.shippingCost,
    tax: row.tax,
    total: row.total,
    currency: row.currency,
    taxBreakdown: toRecord(row.taxBreakdown),
    shippingCarrier: row.shippingCarrier,
    shippingMethod: row.shippingMethod,
    trackingNumber: row.trackingNumber,
    notes: row.notes,
    paidAt: row.paidAt,
    shippedAt: row.shippedAt,
    deliveredAt: row.deliveredAt,
    cancelledAt: row.cancelledAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: (row.items ?? []).map((item) => toItemDomain(item)),
    address: row.address ? toAddressDomain(row.address) : null,
  };
}

function toItemDomain(row: OrderItemRow): OrderItem {
  return {
    id: row.id,
    orderId: row.orderId,
    productId: row.productId,
    variantId: row.variantId,
    name: row.name,
    price: row.price,
    quantity: row.quantity,
    image: row.image,
  };
}

function toAddressDomain(row: OrderAddressRow): OrderAddress {
  return {
    id: row.id,
    orderId: row.orderId,
    label: row.label,
    line1: row.line1,
    line2: row.line2,
    city: row.city,
    state: row.state,
    postalCode: row.postalCode,
    country: row.country,
  };
}

function toPrismaCreate(
  tenantId: string | null,
  input: CreateOrderInput,
): Prisma.OrderUncheckedCreateInput {
  return {
    tenantId: tenantId ?? null,
    orderNumber: input.orderNumber,
    userId: input.userId ?? null,
    email: input.email,
    status: input.status as OrderRow["status"] | undefined,
    subtotal: input.subtotal,
    discountAmount: input.discountAmount ?? 0,
    shippingCost: input.shippingCost ?? 0,
    tax: input.tax ?? 0,
    total: input.total,
    currency: input.currency ?? "usd",
    taxBreakdown: toJson(input.taxBreakdown),
    shippingCarrier: input.shippingCarrier,
    shippingMethod: input.shippingMethod,
    notes: input.notes,
    items: {
      create: input.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId ?? null,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image ?? null,
      })),
    },
    address: input.address
      ? {
          create: {
            label: input.address.label,
            line1: input.address.line1,
            line2: input.address.line2,
            city: input.address.city,
            state: input.address.state,
            postalCode: input.address.postalCode,
            country: input.address.country,
          },
        }
      : undefined,
  };
}

function toPrismaUpdate(input: UpdateOrderInput): Prisma.OrderUpdateManyMutationInput {
  return {
    status: input.status as OrderRow["status"] | undefined,
    email: input.email,
    subtotal: input.subtotal,
    discountAmount: input.discountAmount,
    shippingCost: input.shippingCost,
    tax: input.tax,
    total: input.total,
    taxBreakdown: toJson(input.taxBreakdown),
    shippingCarrier: input.shippingCarrier,
    shippingMethod: input.shippingMethod,
    trackingNumber: input.trackingNumber,
    notes: input.notes,
    paidAt: input.paidAt,
    shippedAt: input.shippedAt,
    deliveredAt: input.deliveredAt,
    cancelledAt: input.cancelledAt,
  };
}

function toFilter(tenantId: string | null, filter?: OrderListFilter): Prisma.OrderWhereInput {
  return {
    ...tenantScope(tenantId),
    ...(filter?.status ? { status: filter.status as OrderRow["status"] } : {}),
    ...(filter?.userId ? { userId: filter.userId } : {}),
  };
}

export class PrismaOrderRepository implements OrderRepository {
  async findById(tenantId: string | null, id: string): Promise<Order | null> {
    const row = (await prisma.order.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: ORDER_INCLUDE,
    })) as OrderWithRelations | null;
    return row ? toDomain(row) : null;
  }

  async findByNumber(tenantId: string | null, orderNumber: string): Promise<Order | null> {
    const row = (await prisma.order.findFirst({
      where: { orderNumber, ...tenantScope(tenantId) },
      include: ORDER_INCLUDE,
    })) as OrderWithRelations | null;
    return row ? toDomain(row) : null;
  }

  async list(tenantId: string | null, filter?: OrderListFilter): Promise<OrderListResult> {
    const page = filter?.page ?? 1;
    const pageSize = filter?.pageSize ?? 20;
    const where = toFilter(tenantId, filter);
    const [rows, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: ORDER_INCLUDE,
      }),
      prisma.order.count({ where }),
    ]);
    return {
      items: rows.map((row) => toDomain(row as OrderWithRelations)),
      total,
      page,
      pageSize,
    };
  }

  async create(tenantId: string | null, input: CreateOrderInput): Promise<Order> {
    const row = (await prisma.order.create({
      data: toPrismaCreate(tenantId, input),
      include: ORDER_INCLUDE,
    })) as OrderWithRelations;
    return toDomain(row);
  }

  async update(tenantId: string | null, id: string, input: UpdateOrderInput): Promise<Order> {
    const result = await prisma.order.updateMany({
      where: { id, ...tenantScope(tenantId) },
      data: toPrismaUpdate(input),
    });
    if (result.count === 0) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    const row = (await prisma.order.findFirst({
      where: { id, ...tenantScope(tenantId) },
      include: ORDER_INCLUDE,
    })) as OrderWithRelations | null;
    if (!row) {
      throw new NotFoundError(`Order ${id} not found`);
    }
    return toDomain(row);
  }
}

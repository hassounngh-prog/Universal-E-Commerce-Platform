import type {
  CreateOrderInput,
  Order,
  OrderListFilter,
  OrderListResult,
  UpdateOrderInput,
} from "./types";

export interface OrderRepository {
  findById(tenantId: string | null, id: string): Promise<Order | null>;
  findByNumber(tenantId: string | null, orderNumber: string): Promise<Order | null>;
  list(tenantId: string | null, filter?: OrderListFilter): Promise<OrderListResult>;
  create(tenantId: string | null, input: CreateOrderInput): Promise<Order>;
  update(tenantId: string | null, id: string, input: UpdateOrderInput): Promise<Order>;
}

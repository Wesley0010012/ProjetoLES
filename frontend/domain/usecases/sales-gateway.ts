import type { Exchange, Sale, SalesSeries } from "@/domain/models/sales";

export type SalesPage<T> = { entities: T[]; totalEntities: number; totalPages: number };
export interface SalesGateway {
  listPage(page: number, pageSize: number): Promise<SalesPage<Sale>>;
  exchangesPage(page: number, pageSize: number): Promise<SalesPage<Exchange>>;
  list(): Promise<Sale[]>;
  listByCustomer(customerId: number): Promise<Sale[]>;
  process(id: number): Promise<void>;
  confirmPayment(id: number): Promise<void>;
  dispatch(id: number): Promise<void>;
  deliver(id: number): Promise<void>;
  exchanges(): Promise<Exchange[]>;
  authorizeExchange(id: number, observation: string): Promise<void>;
  rejectExchange(id: number, observation: string): Promise<void>;
  markExchangeReceived(id: number): Promise<void>;
  receiveExchange(
    id: number,
    returnToStock: boolean,
    receivedAt: string,
  ): Promise<{ code: string; value: number }>;
  analyze(
    startDate: string,
    endDate: string,
    groupBy: "PRODUCT" | "CATEGORY",
  ): Promise<SalesSeries[]>;
}

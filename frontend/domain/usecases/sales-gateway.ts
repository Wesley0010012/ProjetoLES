import type {
  Exchange,
  Sale,
  SalesSeries,
  Coupon,
  CouponPayload,
} from "@/domain/models/sales";

export interface SalesGateway {
  list(): Promise<Sale[]>;
  listByCustomer(customerId: number): Promise<Sale[]>;
  dispatch(id: number): Promise<void>;
  deliver(id: number): Promise<void>;
  exchanges(): Promise<Exchange[]>;
  authorizeExchange(id: number, observation: string): Promise<void>;
  rejectExchange(id: number, observation: string): Promise<void>;
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
  coupons(): Promise<Coupon[]>;
  createCoupon(payload: CouponPayload): Promise<{ id: number; code: string }>;
  deactivateCoupon(id: number): Promise<void>;
}

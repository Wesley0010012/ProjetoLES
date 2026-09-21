import { SalesSearch } from '../../application/SalesSearch';
export const SALES_USE_CASES = Symbol('SALES_USE_CASES');

export interface SalesUseCases {
  list(search: SalesSearch): Promise<unknown>;
  process(id: number): Promise<void>;
  confirmPayment(id: number): Promise<void>;
  dispatch(id: number): Promise<void>;
  deliver(id: number): Promise<void>;
  exchanges(search: SalesSearch): Promise<unknown>;
  authorizeExchange(id: number, observation: string): Promise<void>;
  rejectExchange(id: number, observation: string): Promise<void>;
  markExchangeReceived(id: number): Promise<void>;
  receiveExchange(
    id: number,
    returnToStock: boolean,
    receivedAt: Date,
  ): Promise<unknown>;
  analyze(
    startDate: Date,
    endDate: Date,
    groupBy: 'PRODUCT' | 'CATEGORY',
  ): Promise<unknown>;
}

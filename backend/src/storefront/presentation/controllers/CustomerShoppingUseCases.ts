import type {
  CheckoutInput,
  ExchangeInput,
} from '../../application/ShoppingInputs';

export const CUSTOMER_SHOPPING_USE_CASES = Symbol(
  'CUSTOMER_SHOPPING_USE_CASES',
);

export interface CustomerShoppingUseCases {
  coupons(userId: number): Promise<unknown>;
  confirmReceipt(userId: number, saleId: number): Promise<void>;
  cancelOrder(userId: number, saleId: number): Promise<void>;
  dispatchExchange(userId: number, saleId: number): Promise<void>;
  cart(userId: number): Promise<unknown>;
  addItem(userId: number, bookId: number, quantity: number): Promise<unknown>;
  updateItem(
    userId: number,
    bookId: number,
    quantity: number,
  ): Promise<unknown>;
  removeItem(userId: number, bookId: number): Promise<unknown>;
  checkout(userId: number, input: CheckoutInput): Promise<unknown>;
  orders(userId: number): Promise<unknown>;
  requestExchange(userId: number, input: ExchangeInput): Promise<unknown>;
  recommendations(userId: number, context: string): Promise<unknown>;
}

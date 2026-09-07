import type {
  CustomerCart,
  CustomerOrder,
  SelfProfile,
  StoreProduct,
  AssistantChatMessage,
  AssistantResponse,
  CustomerCoupon,
} from "@/domain/models/storefront";

export interface StorefrontGateway {
  products(query?: string, category?: string): Promise<StoreProduct[]>;
  product(id: number): Promise<StoreProduct | null>;
  categories(): Promise<string[]>;
  publicRecommendations(context: string): Promise<StoreProduct[]>;
  recommendations(context: string): Promise<StoreProduct[]>;
  profile(): Promise<SelfProfile>;
  completeProfile(payload: Record<string, unknown>): Promise<void>;
  updateProfile(payload: Record<string, unknown>): Promise<void>;
  inactivateProfile(): Promise<void>;
  addAddress(payload: Record<string, unknown>): Promise<void>;
  updateAddress(id: number, payload: Record<string, unknown>): Promise<void>;
  deleteAddress(id: number): Promise<void>;
  addCard(payload: Record<string, unknown>): Promise<void>;
  updateCard(id: number, payload: Record<string, unknown>): Promise<void>;
  deleteCard(id: number): Promise<void>;
  cart(): Promise<CustomerCart>;
  addToCart(bookId: number, quantity: number): Promise<CustomerCart>;
  updateCart(bookId: number, quantity: number): Promise<CustomerCart>;
  removeFromCart(bookId: number): Promise<CustomerCart>;
  checkout(payload: Record<string, unknown>): Promise<Record<string, unknown>>;
  orders(): Promise<CustomerOrder[]>;
  confirmReceipt(saleId: number): Promise<void>;
  cancelOrder(saleId: number): Promise<void>;
  requestExchange(
    saleId: number,
    items: { bookId: number; quantity: number }[],
    reason: string,
  ): Promise<{ id: number; code: string }>;
  dispatchExchange(saleId: number): Promise<void>;
  coupons(): Promise<CustomerCoupon[]>;
  askAssistant(
    message: string,
    history: AssistantChatMessage[],
  ): Promise<AssistantResponse>;
}

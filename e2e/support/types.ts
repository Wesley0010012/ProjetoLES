// Tipos de domínio da Libra usados pelos testes E2E.
// Este módulo não depende do Cypress nem de nenhuma outra ferramenta de teste:
// é a camada "de domínio" da arquitetura, reutilizável caso o runner mude.

export type SessionType = 'USER' | 'OPERATOR';

export interface AuthSession {
  token: string;
  userId: number;
  type: SessionType;
  email?: string;
  document?: string;
  profile?: CustomerProfile;
}

export type AddressType = 'Primary' | 'Billing' | 'Delivery';

export interface Address {
  id?: number;
  name: string;
  residenceType: string;
  streetType: string;
  street: string;
  number: string;
  district: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
  type: AddressType | string;
}

export type CardBrand = 'VISA' | 'MASTERCARD';

export interface Card {
  id?: number;
  number: string;
  printedName: string;
  brand: CardBrand | string;
  securityCode: string;
  preferred: boolean;
  description?: string;
}

export interface ProfileOverrides {
  name?: string;
  gender?: string;
  birthDate?: string;
  phoneType?: string;
  phoneDdd?: string;
  phoneNumber?: string;
  addresses?: Address[];
  cards?: Card[];
  [key: string]: unknown;
}

export interface Profile {
  name: string;
  gender: string;
  birthDate: string;
  document: string;
  phoneType: string;
  phoneDdd: string;
  phoneNumber: string;
  addresses: Address[];
  cards: Card[];
}

export interface CustomerProfile {
  complete?: boolean;
  customer: { name: string; document: string };
  addresses: Address[];
  cards: Card[];
}

export interface Identity {
  email: string;
  document: string;
}

export interface Book {
  id: number;
  title: string;
  price: number;
  available: boolean;
  availableQuantity: number;
}

export interface CartItem {
  bookId: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  estimatedFreight: number;
}

export interface PreparedCart extends Cart {
  product: Book;
}

export interface CardPayment {
  cardId: number;
  amount: number;
}

export interface CheckoutPayload {
  addressId?: number;
  cardPayments: CardPayment[];
  couponCodes: string[];
}

export type SaleStatus =
  | 'EM_ABERTO'
  | 'EM_PROCESSAMENTO'
  | 'PAGAMENTO_REALIZADO'
  | 'EM_TRANSITO'
  | 'ENTREGUE'
  | 'CANCELADA'
  | 'REPROVADA';

export interface Sale {
  id: number;
  code: string;
  status: SaleStatus;
  product: Book;
  appliedCoupons?: AppliedCoupon[];
}

export interface AppliedCoupon {
  code: string;
  applied: number;
  remaining?: number;
  active: boolean;
}

export type AdvanceStep = 'process' | 'payment' | 'dispatch' | 'deliver';

export type ExchangeStatus =
  | 'EM_TROCA'
  | 'TROCA_AUTORIZADA'
  | 'TROCA_RECUSADA'
  | 'EM_DEVOLUCAO'
  | 'ITEM_RECEBIDO'
  | 'TROCADO';

export interface Exchange {
  id: number;
  code: string;
  status: ExchangeStatus;
}

export type CouponType = 'PROMOTIONAL' | 'EXCHANGE';

export interface Coupon {
  code: string;
  type: CouponType;
  value: number;
}

export type Sale = {
  id: number;
  code: string;
  customer: { id: number; code: string; name: string };
  items: {
    bookId: number;
    code: string;
    title: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  status: string;
  saleDate: string;
  freight: number;
  total: number;
  deliveryAddress?: string;
  coupons?: string[];
  payments?: { label: string; amount: number }[];
};

export type Exchange = {
  id: number;
  code: string;
  saleId: number;
  saleCode: string;
  customer: string;
  items: { bookId: number; title: string; quantity: number; unitPrice: number }[];
  status: string;
  requestedAt: string;
  receivedAt?: string;
  returnToStock?: boolean;
  coupon?: { code: string; value: number };
  total: number;
  reason?: string;
  reviewObservation?: string;
};

export type SalesSeries = {
  name: string;
  points: { date: string; quantity: number; profit?: number }[];
};

export type Coupon = {
  id: number;
  code: string;
  type: "EXCHANGE" | "PROMOTIONAL";
  discountType: "FIXED" | "PERCENTAGE";
  value: number;
  customer?: { id: number; code: string; name: string };
  expiresAt?: string;
  singleUse: boolean;
  used: boolean;
  active: boolean;
  createdAt: string;
};

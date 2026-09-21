import type { CustomerAddress } from "./customer";
export type StoreProduct = {
  id: number;
  code: string;
  title: string;
  authors: string[];
  categories: string[];
  editors: string[];
  year: number;
  edition: string;
  isbn: string;
  synopsis: string;
  numberOfPages: number;
  dimensions: { height: number; width: number; weight: number; depth: number };
  precificationGroup: {
    id: number;
    name: string;
    profitMarginPercentage: number;
  };
  barcode: string;
  coverImage: string;
  price: number;
  availableQuantity: number;
  available: boolean;
  recommendationReason?: string;
};

export type CustomerCart = {
  id: number;
  items: {
    bookId: number;
    code: string;
    title: string;
    authors: string[];
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  estimatedFreight: number;
  expiresAt?: string;
};

export type CustomerOrder = {
  id: number;
  code: string;
  status: string;
  saleDate: string;
  freight: number;
  total: number;
  subtotal?: number;
  discount?: number;
  deliveryAddress?: {
    name: string;
    street: string;
    number: string;
    city: string;
    state: string;
  };
  coupons?: string[];
  payments?: { cardId: number; brand: string; lastFourDigits: string; amount: number }[];
  exchanges?: {
    code: string;
    reason: string;
    status: string;
    items: { bookId: number; title: string; quantity: number }[];
  }[];
  items: {
    bookId: number;
    title: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
};

export type SelfProfile = {
  complete: boolean;
  customer?: {
    id: number;
    code: string;
    name: string;
    gender: string;
    birthDate: string;
    document: string;
    phone: { type: string; ddd: string; number: string };
    email: string;
  };
  rankingPosition?: number;
  addresses?: CustomerAddress[];
  cards?: {
    id: number;
    lastFourDigits: string;
    printedName: string;
    brand: string;
    preferred: boolean;
    description?: string;
  }[];
};

export type AssistantChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type AssistantResponse = {
  answer: string;
  products: {
    id: number;
    title: string;
    price: number;
    available: boolean;
  }[];
  provider: string;
};

export type CustomerCoupon = {
  code: string;
  type: "PROMOTIONAL" | "EXCHANGE";
  discountType: "PERCENTAGE" | "FIXED";
  value: number;
  description: string;
  active: boolean;
  used: boolean;
};

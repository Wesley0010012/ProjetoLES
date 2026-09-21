export type CheckoutInput = {
  addressId: number;
  cardPayments: {
    cardId: number;
    amount: number;
  }[];
  couponCodes: string[];
};

export type ExchangeInput = {
  reason: string;
  saleId: number;
  items: {
    bookId: number;
    quantity: number;
  }[];
};

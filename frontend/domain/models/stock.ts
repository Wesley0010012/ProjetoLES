export type StockItem = {
  bookId: number;
  code: string;
  title: string;
  availableQuantity: number;
  blockedQuantity?: number;
  costBasis: number;
  salePrice: number;
  profitMarginPercentage: number;
};

export type StockSupplier = {
  id: number;
  name: string;
  document: string;
};

export type StockBook = {
  id: number;
  code: string;
  title: string;
};

export type StockEntryPayload = {
  bookId: number;
  quantity: number;
  unitCost: number;
  supplierId: number;
  entryDate: string;
};

export type StockQuantityPayload = {
  bookId: number;
  quantity: number;
  occurredAt: string;
};

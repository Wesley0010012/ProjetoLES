import type {
  StockBook,
  StockEntryPayload,
  StockItem,
  StockQuantityPayload,
  StockSupplier,
} from "@/domain/models/stock";

export interface StockGateway {
  list(): Promise<StockItem[]>;
  listBooks(): Promise<StockBook[]>;
  listSuppliers(): Promise<StockSupplier[]>;
  addSupplier(name: string, document: string): Promise<StockSupplier>;
  deleteSupplier(id: number): Promise<void>;
  enter(payload: StockEntryPayload): Promise<StockItem>;
  withdraw(payload: StockQuantityPayload): Promise<void>;
  reenter(payload: StockQuantityPayload): Promise<void>;
}

import type {
  StockBook,
  StockEntryPayload,
  StockItem,
  StockQuantityPayload,
  StockSupplier,
} from "@/domain/models/stock";
import type { StockGateway } from "@/domain/usecases/stock-gateway";

const items: StockItem[] = [
  {
    bookId: 1,
    code: "LIB-0001",
    title: "Clean Code",
    availableQuantity: 20,
    costBasis: 32,
    salePrice: 41.6,
    profitMarginPercentage: 30,
  },
  {
    bookId: 2,
    code: "LIB-0002",
    title: "Domain-Driven Design",
    availableQuantity: 15,
    costBasis: 38,
    salePrice: 49.4,
    profitMarginPercentage: 40,
  },
  {
    bookId: 3,
    code: "LIB-0003",
    title: "The Pragmatic Programmer",
    availableQuantity: 12,
    costBasis: 24,
    salePrice: 28.8,
    profitMarginPercentage: 20,
  },
];
const suppliers: StockSupplier[] = [
  { id: 1, name: "Byte Distribuidora", document: "11222333000181" },
  { id: 2, name: "Stack Livros Técnicos", document: "44555666000102" },
];

export class MockStockGateway implements StockGateway {
  public async list(): Promise<StockItem[]> {
    return [...items];
  }

  public async listBooks(): Promise<StockBook[]> {
    return items.map(({ bookId: id, code, title }) => ({ id, code, title }));
  }

  public async listSuppliers(): Promise<StockSupplier[]> {
    return [...suppliers];
  }

  public async addSupplier(name: string, document: string): Promise<StockSupplier> {
    const supplier = {
      id: Math.max(0, ...suppliers.map((item) => item.id)) + 1,
      name,
      document,
    };
    suppliers.push(supplier);
    return supplier;
  }

  public async deleteSupplier(id: number): Promise<void> {
    const index = suppliers.findIndex((item) => item.id === id);
    if (index >= 0) suppliers.splice(index, 1);
  }

  public async enter(payload: StockEntryPayload): Promise<StockItem> {
    const item = this.item(payload.bookId);
    item.availableQuantity += payload.quantity;
    item.costBasis = Math.max(item.costBasis, payload.unitCost);
    item.salePrice =
      Math.round(item.costBasis * (1 + item.profitMarginPercentage / 100) * 100) / 100;
    return { ...item };
  }

  public async withdraw(payload: StockQuantityPayload): Promise<void> {
    const item = this.item(payload.bookId);
    if (payload.quantity > item.availableQuantity) {
      throw new Error("Quantidade indisponível em estoque.");
    }
    item.availableQuantity -= payload.quantity;
  }

  public async reenter(payload: StockQuantityPayload): Promise<void> {
    this.item(payload.bookId).availableQuantity += payload.quantity;
  }

  private item(bookId: number): StockItem {
    const item = items.find((candidate) => candidate.bookId === bookId);
    if (!item) throw new Error("Livro não encontrado.");
    return item;
  }
}

import products from 'src/books/infrastructure/persistence/in-memory/catalog-seed.json';
import { BOOKS_SEED } from 'src/books/infrastructure/persistence/in-memory/BooksSeed';
import { BookSalePrice } from 'src/stock/domain/entities/BookSalePrice';
import { StockBalance } from 'src/stock/domain/entities/StockBalance';
import { StockEntry } from 'src/stock/domain/entities/StockEntry';
import { StockMovement } from 'src/stock/domain/entities/StockMovement';
import { Supplier } from 'src/stock/domain/entities/Supplier';
import { StockMovementType } from 'src/stock/domain/enums/StockMovementType';

const byteSupplier = new Supplier(
  {
    name: 'Byte Distribuidora',
    document: '11222333000181',
  },
  1,
);
const stackSupplier = new Supplier(
  {
    name: 'Stack Livros Técnicos',
    document: '44555666000102',
  },
  2,
);

export const SUPPLIERS_SEED = [byteSupplier, stackSupplier];

export const STOCK_ENTRIES_SEED = [
  new StockEntry(
    {
      book: BOOKS_SEED[0],
      quantity: 20,
      unitCost: 32,
      supplier: byteSupplier,
      entryDate: new Date('2026-01-10T00:00:00.000Z'),
    },
    1,
  ),
  new StockEntry(
    {
      book: BOOKS_SEED[1],
      quantity: 15,
      unitCost: 38,
      supplier: stackSupplier,
      entryDate: new Date('2026-01-12T00:00:00.000Z'),
    },
    2,
  ),
  new StockEntry(
    {
      book: BOOKS_SEED[2],
      quantity: 12,
      unitCost: 24,
      supplier: byteSupplier,
      entryDate: new Date('2026-01-15T00:00:00.000Z'),
    },
    3,
  ),
];

export const STOCK_BALANCES_SEED = [
  new StockBalance({ book: BOOKS_SEED[0], availableQuantity: 20 }, 1),
  new StockBalance({ book: BOOKS_SEED[1], availableQuantity: 15 }, 2),
  new StockBalance({ book: BOOKS_SEED[2], availableQuantity: 12 }, 3),
];

export const BOOK_SALE_PRICES_SEED = [
  new BookSalePrice({ book: BOOKS_SEED[0], costBasis: 32, salePrice: 41.6 }, 1),
  new BookSalePrice({ book: BOOKS_SEED[1], costBasis: 38, salePrice: 49.4 }, 2),
  new BookSalePrice({ book: BOOKS_SEED[2], costBasis: 24, salePrice: 28.8 }, 3),
];

export const STOCK_MOVEMENTS_SEED = STOCK_ENTRIES_SEED.map(
  (entry, index) =>
    new StockMovement(
      {
        book: entry.book,
        type: StockMovementType.ENTRY,
        quantity: entry.quantity,
        occurredAt: entry.entryDate,
      },
      index + 1,
    ),
);

for (const product of products.filter((p) => p.id > 3)) {
  const book = BOOKS_SEED.find((b) => b.id === product.id)!;
  STOCK_BALANCES_SEED.push(
    new StockBalance(
      { book, availableQuantity: product.availableQuantity },
      product.id,
    ),
  );
  BOOK_SALE_PRICES_SEED.push(
    new BookSalePrice(
      {
        book,
        costBasis:
          product.price /
          (1 + book.precificationGroup.profitMarginPercentage / 100),
        salePrice: product.price,
      },
      product.id,
    ),
  );
}

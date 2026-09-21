import products from 'src/books/infrastructure/persistence/in-memory/catalog-seed.json';
import { BOOKS_SEED } from 'src/books/infrastructure/persistence/in-memory/BooksSeed';
import { Customer } from 'src/customers/domain/entities/Customer';
import { Sale } from 'src/sales/domain/entities/Sale';
import { SaleItem } from 'src/sales/domain/entities/SaleItem';
import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';

export const DEFAULT_REPORT_SALES_COUNT = 20_000;
export const MAX_REPORT_SALES_COUNT = 100_000;

/** Histórico sintético, reproduzível para a mesma data de referência. */
export function createReportSalesSeed(
  customers: Customer[],
  count = DEFAULT_REPORT_SALES_COUNT,
  now = new Date(),
): Sale[] {
  if (!Number.isInteger(count) || count < 0 || count > MAX_REPORT_SALES_COUNT) {
    throw new RangeError(
      `SALES_SEED_COUNT deve ser um inteiro entre 0 e ${MAX_REPORT_SALES_COUNT}`,
    );
  }
  if (!Number.isFinite(now.getTime()))
    throw new RangeError('Data de referência inválida');
  if (count === 0 || customers.length === 0) return [];

  let state = 20260913;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const start = Date.UTC(
    now.getUTCFullYear() - 2,
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const duration = now.getTime() - start;
  const prices = new Map(
    products.map((product) => [product.id, product.price]),
  );
  const sales: Sale[] = [];

  for (let index = 0; index < count; index++) {
    // Os quatro pedidos operacionais existentes conservam seus IDs.
    const id = index + 5;
    // Crescimento gradual concentra mais vendas nos meses recentes.
    const progress = (index + random()) / count;
    const saleDate = new Date(
      start + Math.floor(Math.sqrt(progress) * duration),
    );
    const customer = customers[Math.floor(random() * customers.length)];
    const firstBook = index % BOOKS_SEED.length;
    const itemCount = 1 + Math.floor(random() * 5);
    const items = Array.from({ length: itemCount }, (_, offset) => {
      const book = BOOKS_SEED[(firstBook + offset * 17) % BOOKS_SEED.length];
      const price = prices.get(book.id)!;
      const historicalPrice =
        Math.round(price * (0.85 + random() * 0.3) * 100) / 100;
      return new SaleItem(book, 1 + Math.floor(random() * 4), historicalPrice);
    });
    sales.push(
      new Sale(
        {
          code: `VEN-${String(id).padStart(6, '0')}`,
          customer,
          items,
          status: SaleStatus.DELIVERED,
          saleDate,
          createdAt: saleDate,
          updatedAt: saleDate,
          freight: Math.round((8 + random() * 22) * 100) / 100,
          deliveryAddress: {
            name: 'Endereço demonstrativo',
            street: 'Rua dos Livros',
            number: String(10 + customer.id),
            city: 'São Paulo',
            state: 'SP',
          },
        },
        id,
      ),
    );
  }
  return sales;
}

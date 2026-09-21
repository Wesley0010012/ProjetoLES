import { SaleRepository } from 'src/sales/domain/repositories/SaleRepository';
import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';
import { SalesSearch } from '../SalesSearch';

export class AnalyzeSales {
  public constructor(private readonly _sales: SaleRepository) {}

  public async execute(
    startDate: Date,
    endDate: Date,
    groupBy: 'PRODUCT' | 'CATEGORY',
  ) {
    const page = await this._sales.findAll(new SalesSearch());
    const series = new Map<
      string,
      Map<string, { quantity: number; profit: number }>
    >();

    for (const sale of page.entities) {
      if (
        ![SaleStatus.DELIVERED, SaleStatus.EXCHANGED].includes(sale.status) ||
        sale.saleDate < startDate ||
        sale.saleDate > endDate
      ) {
        continue;
      }
      const date = sale.saleDate.toISOString().slice(0, 10);
      for (const item of sale.items) {
        const names =
          groupBy === 'PRODUCT'
            ? [item.book.title]
            : item.book.categories.map((category) => category.name);
        for (const name of names) {
          const points = series.get(name) ?? new Map();
          const previous = points.get(date) ?? { quantity: 0, profit: 0 };
          const margin =
            item.book.precificationGroup.profitMarginPercentage / 100;
          points.set(date, {
            quantity: previous.quantity + item.quantity,
            profit:
              Math.round(
                (previous.profit + (item.total * margin) / (1 + margin)) * 100,
              ) / 100,
          });
          series.set(name, points);
        }
      }
    }

    return [...series.entries()].map(([name, points]) => ({
      name,
      points: [...points.entries()]
        .sort(([first], [second]) => first.localeCompare(second))
        .map(([date, values]) => ({ date, ...values })),
    }));
  }
}

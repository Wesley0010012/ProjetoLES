import { SaleRepository } from 'src/sales/domain/repositories/SaleRepository';
import { SalesSearch } from 'src/sales/application/SalesSearch';
import type { BookUseCases } from 'src/books/presentation/controllers/BookUseCases';

export class RecommendBooks {
  public constructor(
    private readonly _books: BookUseCases,
    private readonly _sales: SaleRepository,
  ) {}

  public async recommend(
    context: string,
    customerId?: number,
    relatedBookIds: number[] = [],
  ) {
    const products = await this._books.list();
    const page = await this._sales.findAll(new SalesSearch());
    const preferredCategories = new Set<string>();

    if (customerId !== undefined) {
      page.entities
        .filter((sale) => sale.customer.id === customerId)
        .flatMap((sale) => sale.items)
        .forEach((item) =>
          item.book.categories.forEach((category) =>
            preferredCategories.add(category.name),
          ),
        );
    }
    if (relatedBookIds.length > 0) {
      products
        .filter((product) => relatedBookIds.includes(product.id))
        .flatMap((product) => product.categories)
        .forEach((category) => preferredCategories.add(category.name));
    }

    const salesCount = new Map<number, number>();
    page.entities
      .flatMap((sale) => sale.items)
      .forEach((item) =>
        salesCount.set(
          item.book.id,
          (salesCount.get(item.book.id) ?? 0) + item.quantity,
        ),
      );

    return products
      .filter((product) => !relatedBookIds.includes(product.id))
      .sort((first, second) => {
        const firstAffinity = first.categories.some((category) =>
          preferredCategories.has(category.name),
        )
          ? 100
          : 0;
        const secondAffinity = second.categories.some((category) =>
          preferredCategories.has(category.name),
        )
          ? 100
          : 0;
        return (
          secondAffinity +
          (salesCount.get(second.id) ?? 0) -
          firstAffinity -
          (salesCount.get(first.id) ?? 0)
        );
      })
      .slice(0, 6)
      .map((product) => ({
        ...product,
        recommendationReason:
          preferredCategories.size > 0
            ? 'Relacionado ao seu histórico e aos seus interesses'
            : context === 'CART'
              ? 'Leitores também adicionaram ao carrinho'
              : 'Popular entre leitores da Libra',
      }));
  }
}

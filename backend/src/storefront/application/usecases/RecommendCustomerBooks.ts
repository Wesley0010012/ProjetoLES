import { ShoppingUseCase } from './ShoppingUseCase';

export class RecommendCustomerBooks extends ShoppingUseCase {
  public async execute(userId: number, context: string) {
    const customer = await this.customer(userId);
    const cart = await this.cartFor(customer.id);

    return this._recommendations.recommend(
      context,
      customer.id,
      cart.items.map((item) => item.book.id),
    );
  }
}

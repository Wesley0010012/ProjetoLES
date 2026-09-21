import { ShoppingUseCase } from './ShoppingUseCase';

export class GetShoppingCart extends ShoppingUseCase {
  public async execute(userId: number) {
    const customer = await this.customer(userId);
    const cart = await this.cartFor(customer.id);
    await this.expireCart(cart);
    return this._cartMapper.toDto(cart);
  }
}

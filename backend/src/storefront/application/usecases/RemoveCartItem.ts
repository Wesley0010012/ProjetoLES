import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { ShoppingUseCase } from './ShoppingUseCase';

export class RemoveCartItem extends ShoppingUseCase {
  public async execute(userId: number, bookId: number) {
    const customer = await this.customer(userId);
    const cart = await this.cartFor(customer.id);
    await this.expireCart(cart);

    const item = cart.items.find((candidate) => candidate.book.id === bookId);
    const balance = await this._balances.findByBookId(bookId);
    if (!item || !balance) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: bookId });
    }

    balance.unblock(item.quantity);
    cart.items = cart.items.filter((candidate) => candidate.book.id !== bookId);
    await Promise.all([
      this._balances.update(balance),
      this._carts.update(cart),
    ]);

    return this._cartMapper.toDto(cart);
  }
}

import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { ShoppingUseCase } from './ShoppingUseCase';

export class UpdateCartItem extends ShoppingUseCase {
  public async execute(userId: number, bookId: number, quantity: number) {
    const customer = await this.customer(userId);
    const cart = await this.cartFor(customer.id);
    await this.expireCart(cart);

    const item = cart.items.find((candidate) => candidate.book.id === bookId);
    const balance = await this._balances.findByBookId(bookId);
    if (!item || !balance) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: bookId });
    }

    const difference = quantity - item.quantity;
    if (difference > 0 && !balance.canRemove(difference)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'quantity' });
    }

    if (difference > 0) balance.block(difference);
    if (difference < 0) balance.unblock(Math.abs(difference));

    item.quantity = quantity;
    cart.lastItemAddedAt = new Date();
    await Promise.all([
      this._balances.update(balance),
      this._carts.update(cart),
    ]);

    return this._cartMapper.toDto(cart);
  }
}

import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { CartItem } from '../../domain/entities/CartItem';

import { ShoppingUseCase } from './ShoppingUseCase';
export class AddCartItem extends ShoppingUseCase {
  public async execute(userId: number, bookId: number, quantity: number) {
    const customer = await this.customer(userId);
    const cart = await this.cartFor(customer.id);
    await this.expireCart(cart);
    const [book, balance] = await Promise.all([
      this._books.findById(bookId),
      this._balances.findByBookId(bookId),
    ]);
    if (!book || !balance || !book.isActive()) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: bookId });
    }
    if (!balance.canRemove(quantity)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'quantity' });
    }
    const existing = cart.items.find((item) => item.book.id === bookId);
    balance.block(quantity);
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items = [
        ...cart.items,
        new CartItem(book, quantity, book.defaultPrice),
      ];
    }
    cart.lastItemAddedAt = new Date();
    await Promise.all([
      this._balances.update(balance),
      this._carts.update(cart),
    ]);
    return this._cartMapper.toDto(cart);
  }
}

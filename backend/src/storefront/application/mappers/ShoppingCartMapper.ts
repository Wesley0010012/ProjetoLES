import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { ShoppingCart } from '../../domain/entities/ShoppingCart';
import { ShoppingCartDto } from '../dto/ShoppingCartDto';

const CART_TTL_MS = 30 * 60 * 1000;

export class ShoppingCartMapper implements EntityToOutputDto<
  ShoppingCart,
  ShoppingCartDto
> {
  public toDto(cart: ShoppingCart): Promise<ShoppingCartDto> {
    return Promise.resolve(
      new ShoppingCartDto(
        cart.id,
        cart.items.map((item) => ({
          bookId: item.book.id,
          code: item.book.code,
          title: item.book.title,
          authors: item.book.authors.map((author) => author.name),
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        })),
        cart.subtotal,
        this.freight(cart),
        cart.lastItemAddedAt
          ? new Date(cart.lastItemAddedAt.getTime() + CART_TTL_MS)
          : undefined,
      ),
    );
  }

  public freight(cart: ShoppingCart): number {
    return (
      Math.round(
        (10 +
          cart.items.reduce(
            (sum, item) =>
              sum + item.book.dimensions.weight * item.quantity * 2,
            0,
          )) *
          100,
      ) / 100
    );
  }
}

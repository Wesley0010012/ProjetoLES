import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { ShoppingCart } from 'src/storefront/domain/entities/ShoppingCart';
import { ShoppingCartRepository } from 'src/storefront/domain/repositories/ShoppingCartRepository';

export class InMemoryShoppingCartRepository
  extends InMemoryAbstractEntityRepository<ShoppingCart>
  implements ShoppingCartRepository
{
  public async findByCustomerId(
    customerId: number,
  ): Promise<ShoppingCart | null> {
    return (
      this._entities.find(
        (cart) => cart.customer.id === customerId && cart.isActive(),
      ) ?? null
    );
  }
}

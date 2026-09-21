import { Customer } from 'src/customers/domain/entities/Customer';
import { CustomerRepository } from 'src/customers/domain/repositories/CustomerRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';

export class InMemoryCustomerRepository
  extends InMemoryAbstractEntityRepository<Customer>
  implements CustomerRepository
{
  public constructor(seed: Customer[] = []) {
    super();
    this._entities.push(...seed);
  }

  protected override matchesSearch(customer: Customer): boolean {
    return customer.isActive() && customer.user.isActive();
  }

  public existsByDocument(
    document: string,
    ignoredId?: number,
  ): Promise<boolean> {
    return Promise.resolve(
      this._entities.some(
        (customer) =>
          customer.id !== ignoredId && customer.document.number === document,
      ),
    );
  }

  public nextCode(): Promise<string> {
    return Promise.resolve(`CLI-${String(this.getNextId()).padStart(6, '0')}`);
  }

  public findByUserId(userId: number): Promise<Customer | null> {
    return Promise.resolve(
      this._entities.find((customer) => customer.user.id === userId) ?? null,
    );
  }
}

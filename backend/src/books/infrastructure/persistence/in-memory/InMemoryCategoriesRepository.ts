import { Category } from 'src/books/domain/entities/Category';
import { CategoryRepository } from 'src/books/domain/repositories/CategoryRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { CATEGORIES_SEED } from './BooksSeed';

export class InMemoryCategoriesRepository
  extends InMemoryAbstractEntityRepository<Category>
  implements CategoryRepository
{
  protected override seed(): void {
    this._entities.push(...CATEGORIES_SEED);
  }
  protected override matchesSearch(entity: Category): boolean {
    return entity.isActive();
  }
}

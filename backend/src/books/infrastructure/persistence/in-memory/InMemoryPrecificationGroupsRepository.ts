import { PrecificationGroup } from 'src/books/domain/entities/PrecificationGroup';
import { PrecificationGroupRepository } from 'src/books/domain/repositories/PrecificationGroupRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { PRECIFICATION_GROUPS_SEED } from './BooksSeed';

export class InMemoryPrecificationGroupsRepository
  extends InMemoryAbstractEntityRepository<PrecificationGroup>
  implements PrecificationGroupRepository
{
  protected override seed(): void {
    this._entities.push(...PRECIFICATION_GROUPS_SEED);
  }
  protected override matchesSearch(entity: PrecificationGroup): boolean {
    return entity.isActive();
  }
}

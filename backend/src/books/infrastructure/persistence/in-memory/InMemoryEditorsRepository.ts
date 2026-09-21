import { Editor } from 'src/books/domain/entities/Editor';
import { EditorRepository } from 'src/books/domain/repositories/EditorRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { EDITORS_SEED } from './BooksSeed';

export class InMemoryEditorsRepository
  extends InMemoryAbstractEntityRepository<Editor>
  implements EditorRepository
{
  protected override seed(): void {
    this._entities.push(...EDITORS_SEED);
  }
  protected override matchesSearch(entity: Editor): boolean {
    return entity.isActive();
  }
}

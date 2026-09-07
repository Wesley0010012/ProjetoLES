import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { InternalError } from 'src/shared/domain/errors/InternalError';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { AddRepository } from 'src/shared/domain/repositories/protocols/AddRepository';
import { UpdateRepository } from 'src/shared/domain/repositories/protocols/UpdateRepository';
import { EntityPage } from 'src/shared/domain/entities/EntityPage';
import { FindAllRepository } from 'src/shared/domain/repositories/protocols/FindAllRepository';
import { Search } from 'src/shared/domain/repositories/Search';
import { OrderDirection } from 'src/shared/domain/enums/OrderDirection';
import { FindByIdRepository } from 'src/shared/domain/repositories/protocols/FindByIdRepository';

export abstract class InMemoryAbstractEntityRepository<E extends AbstractEntity>
  implements
    AddRepository<E>,
    FindByIdRepository<E>,
    FindAllRepository<E>,
    UpdateRepository<E>
{
  protected readonly _entities: E[];

  public constructor() {
    this._entities = [];

    this.seed();
  }

  protected seed(): void {}

  public add(entity: E): Promise<void> {
    entity.id = this.getNextId();

    this._entities.push(entity);
    return Promise.resolve();
  }

  public findById(id: number): Promise<E | null> {
    return Promise.resolve(
      this._entities.find((entity) => entity.id === id) ?? null,
    );
  }

  public getNextId(): number {
    return (
      this._entities.reduce(
        (highestId, entity) => Math.max(highestId, entity.id),
        0,
      ) + 1
    );
  }

  public getEntityIndexById(id: number): number {
    const matchingIndexes = this._entities.reduce<number[]>(
      (indexes, entity, index) => {
        if (entity.id === id) {
          indexes.push(index);
        }

        return indexes;
      },
      [],
    );

    if (matchingIndexes.length > 1) {
      throw new InternalError(MessageKeyEnum.DUPLICATE_ENTITY_ID, { id });
    }

    if (matchingIndexes.length === 0) {
      throw new InternalError(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    }

    return matchingIndexes[0];
  }

  public update(entity: E): Promise<void> {
    const index = this.getEntityIndexById(entity.id);

    entity.updatedAt = new Date();
    this._entities[index] = entity;
    return Promise.resolve();
  }

  public findAll(search: Search): Promise<EntityPage<E>> {
    const matchingEntities = this._entities.filter((entity) =>
      this.matchesSearch(entity, search),
    );
    const orderedEntities = this.orderEntities(matchingEntities, search);
    const totalEntities = orderedEntities.length;
    const totalPages = search.isPaginated()
      ? Math.ceil(totalEntities / search.pageSize!)
      : totalEntities > 0
        ? 1
        : 0;
    const entities = search.isPaginated()
      ? orderedEntities.slice(
          (search.page! - 1) * search.pageSize!,
          search.page! * search.pageSize!,
        )
      : orderedEntities;

    return Promise.resolve(new EntityPage(totalEntities, entities, totalPages));
  }

  protected matchesSearch(entity: E, search: Search): boolean {
    void entity;
    void search;
    return true;
  }

  private orderEntities(entities: E[], search: Search): E[] {
    const orderedEntities = [...entities];

    if (!search.orderBy) {
      return orderedEntities;
    }

    const direction = search.orderDirection === OrderDirection.ASC ? 1 : -1;

    return orderedEntities.sort(
      (first, second) =>
        this.compareValues(
          this.getOrderValue(first, search.orderBy!),
          this.getOrderValue(second, search.orderBy!),
        ) * direction,
    );
  }

  private getOrderValue(entity: E, field: string): unknown {
    return (entity as unknown as Record<string, unknown>)[field];
  }

  private compareValues(first: unknown, second: unknown): number {
    if (first === second) {
      return 0;
    }

    if (first === undefined || first === null) {
      return 1;
    }

    if (second === undefined || second === null) {
      return -1;
    }

    if (first instanceof Date && second instanceof Date) {
      return first.getTime() - second.getTime();
    }

    if (typeof first === 'string' && typeof second === 'string') {
      return first.localeCompare(second);
    }

    return first < second ? -1 : 1;
  }
}

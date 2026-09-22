import { compareValues } from '../compareValues';
import { Repository } from 'typeorm';
import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { EntityPage } from 'src/shared/domain/entities/EntityPage';
import { OrderDirection } from 'src/shared/domain/enums/OrderDirection';
import { Search } from 'src/shared/domain/repositories/Search';
import { PersistedDomainEntity } from './PersistedDomainEntity';
import { DomainEntityCodec } from './DomainEntityCodec';

/** Base PostgreSQL para repositórios de agregados do domínio. */
export abstract class PostgresAbstractEntityRepository<
  E extends AbstractEntity,
> {
  protected constructor(
    protected readonly records: Repository<PersistedDomainEntity>,
    private readonly codec: DomainEntityCodec,
    private readonly kind: string,
  ) {}

  public async seedIfEmpty(
    createSeed: () => E[] | Promise<E[]>,
  ): Promise<this> {
    if (await this.isEmpty()) {
      for (const entity of await createSeed()) await this.add(entity);
    }
    return this;
  }

  public async add(entity: E): Promise<void> {
    await this.records.manager.transaction(async (manager) => {
      // Serialize id allocation per entity kind across concurrent requests/processes.
      await manager.query('SELECT pg_advisory_xact_lock(hashtext($1))', [this.kind]);
      const records = manager.getRepository(PersistedDomainEntity);
      if (!entity.id) entity.id = await this.getNextId(records);
      await records.insert({
        kind: this.kind,
        domainId: entity.id,
        payload: this.codec.encodeEntity(entity) as Record<string, unknown>,
      });
    });
  }

  public async update(entity: E): Promise<void> {
    entity.updatedAt = new Date();
    await this.persist(entity);
  }

  public async findById(id: number): Promise<E | null> {
    const record = await this.records.findOneBy({
      kind: this.kind,
      domainId: id,
    });
    return record ? this.codec.decode<E>(record.payload) : null;
  }

  public async findAll(search: Search): Promise<EntityPage<E>> {
    const values = (
      await this.records.find({
        where: { kind: this.kind },
        order: { domainId: 'ASC' },
      })
    )
      .map((record) => this.codec.decode<E>(record.payload))
      .filter((entity) => this.matchesSearch(entity, search));
    const ordered = this.order(values, search);
    const totalEntities = ordered.length;
    const entities = search.isPaginated()
      ? ordered.slice(
          (search.page! - 1) * search.pageSize!,
          search.page! * search.pageSize!,
        )
      : ordered;
    return new EntityPage(
      totalEntities,
      entities,
      search.isPaginated()
        ? Math.ceil(totalEntities / search.pageSize!)
        : totalEntities
          ? 1
          : 0,
    );
  }

  protected matchesSearch(entity: E, search: Search): boolean {
    void entity;
    void search;
    return true;
  }

  protected async all(): Promise<E[]> {
    return (await this.records.find({ where: { kind: this.kind } })).map(
      (record) => this.codec.decode<E>(record.payload),
    );
  }

  public async isEmpty(): Promise<boolean> {
    return (await this.records.count({ where: { kind: this.kind } })) === 0;
  }

  protected async getNextId(records = this.records): Promise<number> {
    const result = await records
      .createQueryBuilder('entity')
      .select('COALESCE(MAX(entity.domainId), 0)', 'max')
      .where('entity.kind = :kind', { kind: this.kind })
      .getRawOne<{ max: string }>();
    return Number(result?.max ?? 0) + 1;
  }

  private async persist(entity: E): Promise<void> {
    await this.records.upsert(
      {
        kind: this.kind,
        domainId: entity.id,
        payload: this.codec.encodeEntity(entity) as Record<string, unknown>,
      },
      ['kind', 'domainId'],
    );
  }

  private order(entities: E[], search: Search): E[] {
    if (!search.orderBy) return entities;
    const direction = search.orderDirection === OrderDirection.ASC ? 1 : -1;
    return [...entities].sort((a, b) => {
      const first = (a as unknown as Record<string, unknown>)[search.orderBy!];
      const second = (b as unknown as Record<string, unknown>)[search.orderBy!];
      return compareValues(first, second) * direction;
    });
  }
}

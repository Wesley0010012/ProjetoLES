import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { EntityPage } from 'src/shared/domain/entities/EntityPage';
import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Search, SearchProps } from 'src/shared/domain/repositories/Search';
import { withReadCache } from './withReadCache';

class FakeEntity extends AbstractEntity {}

class FakeSearch extends Search {
  public constructor(props: SearchProps = {}) {
    super(props);
  }
}

class FakeRepository implements CrudRepository<FakeEntity> {
  public findByIdCalls = 0;
  public findAllCalls = 0;
  private readonly entities = new Map<number, FakeEntity>();

  public seed(entity: FakeEntity): void {
    this.entities.set(entity.id, entity);
  }

  public add(entity: FakeEntity): Promise<void> {
    entity.id = this.entities.size + 1;
    this.entities.set(entity.id, entity);
    return Promise.resolve();
  }

  public update(entity: FakeEntity): Promise<void> {
    this.entities.set(entity.id, entity);
    return Promise.resolve();
  }

  public findById(id: number): Promise<FakeEntity | null> {
    this.findByIdCalls++;
    return Promise.resolve(this.entities.get(id) ?? null);
  }

  public findAll(search: Search): Promise<EntityPage<FakeEntity>> {
    void search;
    this.findAllCalls++;
    const entities = [...this.entities.values()];
    return Promise.resolve(new EntityPage(entities.length, entities, 1));
  }

  public extraMethod(): string {
    return 'passthrough';
  }
}

describe('withReadCache', () => {
  it('caches findById results and only hits the repository once per id', async () => {
    const repository = new FakeRepository();
    repository.seed(new FakeEntity({}, 1));
    const cached = withReadCache(repository);

    await cached.findById(1);
    await cached.findById(1);
    await cached.findById(1);

    expect(repository.findByIdCalls).toBe(1);
  });

  it('caches findAll results per distinct search and re-fetches for a different one', async () => {
    const repository = new FakeRepository();
    repository.seed(new FakeEntity({}, 1));
    const cached = withReadCache(repository);

    await cached.findAll(new FakeSearch());
    await cached.findAll(new FakeSearch());
    await cached.findAll(new FakeSearch({ orderBy: 'id' }));

    expect(repository.findAllCalls).toBe(2);
  });

  it('deduplicates concurrent identical reads into a single call', async () => {
    const repository = new FakeRepository();
    repository.seed(new FakeEntity({}, 1));
    const cached = withReadCache(repository);

    await Promise.all([
      cached.findById(1),
      cached.findById(1),
      cached.findById(1),
    ]);

    expect(repository.findByIdCalls).toBe(1);
  });

  it('invalidates every cached read after a write', async () => {
    const repository = new FakeRepository();
    repository.seed(new FakeEntity({}, 1));
    const cached = withReadCache(repository);

    await cached.findById(1);
    await cached.findAll(new FakeSearch());
    await cached.add(new FakeEntity({}));
    await cached.findById(1);
    await cached.findAll(new FakeSearch());

    expect(repository.findByIdCalls).toBe(2);
    expect(repository.findAllCalls).toBe(2);
  });

  it('forwards repository-specific methods untouched', () => {
    const repository = new FakeRepository();
    const cached = withReadCache(repository);

    expect(cached.extraMethod()).toBe('passthrough');
  });
});

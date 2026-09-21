import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { EntityPage } from 'src/shared/domain/entities/EntityPage';
import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Search } from 'src/shared/domain/repositories/Search';

/**
 * Envolve um repositório com um cache de leitura em memória, para acelerar
 * buscas repetidas (findById/findAll) sem tocar o banco a cada chamada.
 *
 * É implementado como um Proxy real: apenas add/update/findById/findAll são
 * interceptados. Qualquer outro método do repositório concreto (findByEmail,
 * findByBookId, nextCode...) passa direto para o alvo, sem precisar redeclarar
 * a interface específica de cada repositório.
 *
 * Estratégia: cada leitura é cacheada pela sua chave (id, ou os campos do
 * Search serializados); qualquer escrita (add/update) invalida o cache
 * inteiro daquele repositório. Simples e sempre correto — o custo é que uma
 * escrita descarta também leituras não relacionadas, o que é aceitável dado
 * o volume de escrita típico deste tipo de aplicação.
 *
 * As promises em voo também ficam em cache (não só o resultado resolvido),
 * então chamadas concorrentes idênticas compartilham a mesma requisição ao
 * banco em vez de dispará-la várias vezes.
 */
export function withReadCache<
  Entity extends AbstractEntity,
  Repository extends CrudRepository<Entity>,
>(repository: Repository): Repository {
  let findAllCache = new Map<string, Promise<EntityPage<Entity>>>();
  let findByIdCache = new Map<number, Promise<Entity | null>>();

  function invalidate(): void {
    findAllCache = new Map();
    findByIdCache = new Map();
  }

  function tracked<Key, Value>(
    cache: Map<Key, Promise<Value>>,
    key: Key,
    load: () => Promise<Value>,
  ): Promise<Value> {
    if (!cache.has(key)) {
      const promise = load().catch((error: unknown) => {
        cache.delete(key);
        throw error;
      });
      cache.set(key, promise);
    }
    return cache.get(key)!;
  }

  // Plain function-valued properties (not TS method shorthand), so returning
  // them below is never flagged as an "unbound method" by the linter.
  type Overrides = {
    add: (entity: Entity) => Promise<void>;
    update: (entity: Entity) => Promise<void>;
    findById: (id: number) => Promise<Entity | null>;
    findAll: (search: Search) => Promise<EntityPage<Entity>>;
  };

  const overrides: Overrides = {
    add: async (entity) => {
      await repository.add(entity);
      invalidate();
    },
    update: async (entity) => {
      await repository.update(entity);
      invalidate();
    },
    findById: (id) => tracked(findByIdCache, id, () => repository.findById(id)),
    findAll: (search) =>
      tracked(findAllCache, JSON.stringify(search), () =>
        repository.findAll(search),
      ),
  };

  return new Proxy(repository, {
    get: (target, property, receiver) => {
      if (property in overrides) {
        return overrides[property as keyof Overrides];
      }
      return Reflect.get(target, property, receiver);
    },
  });
}

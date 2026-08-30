import type {
  Book,
  BookRelation,
  CatalogEntity,
  CatalogPayload,
  CatalogResource,
  NamedEntity,
  PrecificationGroup,
} from "@/domain/models/catalog";
import type { CatalogGateway } from "@/domain/usecases/catalog-gateway";
import { mockStoreProducts } from "@/data/usecases/mock-storefront-gateway";

type MockDatabase = Record<CatalogResource, CatalogEntity[]>;

const storageKey = "libra.catalog.mock.v2";

export class MockCatalogGateway implements CatalogGateway {
  public async list(resource: CatalogResource): Promise<CatalogEntity[]> {
    return this.database()[resource].filter((entity) => entity.active);
  }

  public async findById(resource: CatalogResource, id: number): Promise<CatalogEntity> {
    const entity = this.database()[resource].find((candidate) => candidate.id === id);
    if (!entity) throw new Error("Registro não encontrado.");
    return entity;
  }

  public async create(
    resource: CatalogResource,
    payload: CatalogPayload,
  ): Promise<CatalogEntity> {
    const database = this.database();
    const now = new Date().toISOString();
    const id = Math.max(0, ...database[resource].map((item) => item.id)) + 1;
    const entity = this.toEntity(resource, id, payload, now);
    database[resource].push(entity);
    this.save(database);
    return entity;
  }

  public async update(
    resource: CatalogResource,
    id: number,
    payload: CatalogPayload,
  ): Promise<CatalogEntity> {
    const database = this.database();
    const index = database[resource].findIndex((item) => item.id === id);
    if (index < 0) throw new Error("Registro não encontrado.");
    const current = database[resource][index];
    const entity = {
      ...this.toEntity(resource, id, payload, current.createdAt),
      active: current.active,
      ...(resource === "books"
        ? {
            authors: (current as Book).authors,
            categories: (current as Book).categories,
            editors: (current as Book).editors,
          }
        : {}),
      updatedAt: new Date().toISOString(),
    } as CatalogEntity;
    database[resource][index] = entity;
    this.save(database);
    return entity;
  }

  public async delete(resource: CatalogResource, id: number): Promise<void> {
    const database = this.database();
    const entity = database[resource].find((item) => item.id === id);
    if (!entity) throw new Error("Registro não encontrado.");
    entity.active = false;
    entity.updatedAt = new Date().toISOString();
    this.save(database);
  }

  public async addBookRelation(
    bookId: number,
    relation: BookRelation,
    relatedId: number,
  ): Promise<void> {
    this.changeRelation(bookId, relation, relatedId, true);
  }

  public async removeBookRelation(
    bookId: number,
    relation: BookRelation,
    relatedId: number,
  ): Promise<void> {
    this.changeRelation(bookId, relation, relatedId, false);
  }

  private changeRelation(
    bookId: number,
    relation: BookRelation,
    relatedId: number,
    add: boolean,
  ): void {
    const database = this.database();
    const book = database.books.find((item) => item.id === bookId) as Book;
    const related = database[relation].find(
      (item) => item.id === relatedId,
    ) as NamedEntity;
    if (!book || !related) throw new Error("Registro não encontrado.");
    book[relation] = add
      ? [...book[relation].filter((item) => item.id !== relatedId), related]
      : book[relation].filter((item) => item.id !== relatedId);
    book.updatedAt = new Date().toISOString();
    this.save(database);
  }

  private toEntity(
    resource: CatalogResource,
    id: number,
    payload: CatalogPayload,
    createdAt: string,
  ): CatalogEntity {
    const common = {
      id,
      active: true,
      createdAt,
      updatedAt: new Date().toISOString(),
    };
    if (resource !== "books") {
      return {
        ...common,
        name: String(payload.name),
        ...(resource === "precification-groups"
          ? {
              profitMarginPercentage: Number(payload.profitMarginPercentage),
            }
          : {}),
      } as CatalogEntity;
    }

    const database = this.database();
    const group = database["precification-groups"].find(
      (item) => item.id === Number(payload.precificationGroupId),
    ) as PrecificationGroup;
    if (!group) throw new Error("Grupo de precificação não encontrado.");
    return {
      ...common,
      ...payload,
      code: String(payload.code),
      year: Number(payload.year),
      title: String(payload.title),
      edition: String(payload.edition),
      isbn: String(payload.isbn),
      numberOfPages: Number(payload.numberOfPages),
      synopsis: String(payload.synopsis),
      barcode: String(payload.barcode),
      dimensions: payload.dimensions as Book["dimensions"],
      precificationGroup: group,
      authors: [],
      categories: [],
      editors: [],
    } as Book;
  }

  private database(): MockDatabase {
    const serialized = localStorage.getItem(storageKey);
    if (serialized) return JSON.parse(serialized) as MockDatabase;
    const now = new Date().toISOString();
    const named = (names: string[]): NamedEntity[] =>
      [...new Set(names)].map((name, index) => ({
        id: index + 1,
        name,
        active: true,
        createdAt: now,
        updatedAt: now,
      }));
    const authors = named(mockStoreProducts.flatMap((book) => book.authors));
    const categories = named(mockStoreProducts.flatMap((book) => book.categories));
    const editors = named(mockStoreProducts.flatMap((book) => book.editors));
    const groups: PrecificationGroup[] = [
      {
        id: 1,
        name: "Padrão",
        profitMarginPercentage: 35,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2,
        name: "Especializada",
        profitMarginPercentage: 40,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
    const database: MockDatabase = {
      authors,
      categories,
      editors,
      "precification-groups": groups,
      books: mockStoreProducts.map((book) => ({
        ...book,
        authors: authors.filter((item) => book.authors.includes(item.name)),
        categories: categories.filter((item) => book.categories.includes(item.name)),
        editors: editors.filter((item) => book.editors.includes(item.name)),
        precificationGroup:
          groups.find((item) => item.id === book.precificationGroup.id) ?? groups[0],
        active: true,
        createdAt: now,
        updatedAt: now,
      })),
    };
    this.save(database);
    return database;
  }

  private save(database: MockDatabase): void {
    localStorage.setItem(storageKey, JSON.stringify(database));
  }
}

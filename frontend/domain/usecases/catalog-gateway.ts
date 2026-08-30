import type {
  BookRelation,
  CatalogEntity,
  CatalogPayload,
  CatalogResource,
} from "@/domain/models/catalog";

export interface CatalogGateway {
  list(resource: CatalogResource): Promise<CatalogEntity[]>;
  findById(resource: CatalogResource, id: number): Promise<CatalogEntity>;
  create(resource: CatalogResource, payload: CatalogPayload): Promise<CatalogEntity>;
  update(
    resource: CatalogResource,
    id: number,
    payload: CatalogPayload,
  ): Promise<CatalogEntity>;
  delete(resource: CatalogResource, id: number): Promise<void>;
  addBookRelation(
    bookId: number,
    relation: BookRelation,
    relatedId: number,
  ): Promise<void>;
  removeBookRelation(
    bookId: number,
    relation: BookRelation,
    relatedId: number,
  ): Promise<void>;
}

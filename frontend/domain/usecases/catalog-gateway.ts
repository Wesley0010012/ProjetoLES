import type { CatalogEntity, CatalogResource } from "@/domain/models/catalog";
export interface CatalogGateway {
  list(resource: CatalogResource): Promise<CatalogEntity[]>;
}

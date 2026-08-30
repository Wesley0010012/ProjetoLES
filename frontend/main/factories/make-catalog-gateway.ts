import { MockCatalogGateway } from "@/data/usecases/mock-catalog-gateway";
import { RemoteCatalogGateway } from "@/data/usecases/remote-catalog-gateway";
import type { CatalogGateway } from "@/domain/usecases/catalog-gateway";
import { apiUrl, isMockEnvironment } from "@/main/connectors/runtime-environment";

export function makeCatalogGateway(): CatalogGateway {
  return isMockEnvironment()
    ? new MockCatalogGateway()
    : new RemoteCatalogGateway(apiUrl());
}

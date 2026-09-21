import { RemoteCatalogGateway } from "@/data/usecases/remote-catalog-gateway";
import { apiUrl } from "@/main/connectors/runtime-environment";
export function makeCatalogGateway() {
  return new RemoteCatalogGateway(apiUrl());
}

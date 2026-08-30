import { MockStorefrontGateway } from "@/data/usecases/mock-storefront-gateway";
import { RemoteStorefrontGateway } from "@/data/usecases/remote-storefront-gateway";
import type { StorefrontGateway } from "@/domain/usecases/storefront-gateway";
import { apiUrl, isMockEnvironment } from "@/main/connectors/runtime-environment";

export function makeStorefrontGateway(): StorefrontGateway {
  return isMockEnvironment()
    ? new MockStorefrontGateway()
    : new RemoteStorefrontGateway(apiUrl());
}

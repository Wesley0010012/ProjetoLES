import { MockSalesGateway } from "@/data/usecases/mock-sales-gateway";
import { RemoteSalesGateway } from "@/data/usecases/remote-sales-gateway";
import type { SalesGateway } from "@/domain/usecases/sales-gateway";
import { apiUrl, isMockEnvironment } from "@/main/connectors/runtime-environment";

export function makeSalesGateway(): SalesGateway {
  return isMockEnvironment() ? new MockSalesGateway() : new RemoteSalesGateway(apiUrl());
}

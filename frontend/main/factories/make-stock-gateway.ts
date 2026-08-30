import { MockStockGateway } from "@/data/usecases/mock-stock-gateway";
import { RemoteStockGateway } from "@/data/usecases/remote-stock-gateway";
import type { StockGateway } from "@/domain/usecases/stock-gateway";
import { apiUrl, isMockEnvironment } from "@/main/connectors/runtime-environment";

export function makeStockGateway(): StockGateway {
  return isMockEnvironment() ? new MockStockGateway() : new RemoteStockGateway(apiUrl());
}

import { RemoteSalesGateway } from "@/data/usecases/remote-sales-gateway";
import { apiUrl } from "@/main/connectors/runtime-environment";
export function makeSalesGateway() {
  return new RemoteSalesGateway(apiUrl());
}

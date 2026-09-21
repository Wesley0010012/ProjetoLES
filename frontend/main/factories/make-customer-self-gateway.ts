import { RemoteCustomerSelfGateway } from "@/data/usecases/remote-customer-self-gateway";
import { apiUrl } from "@/main/connectors/runtime-environment";
export function makeCustomerSelfGateway() {
  return new RemoteCustomerSelfGateway(apiUrl());
}

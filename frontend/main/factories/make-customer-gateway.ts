import { RemoteCustomerGateway } from "@/data/usecases/remote-customer-gateway";
import type { CustomerGateway } from "@/domain/usecases/customer-gateway";
import { apiUrl } from "@/main/connectors/runtime-environment";
export function makeCustomerGateway(): CustomerGateway {
  return new RemoteCustomerGateway(apiUrl());
}

import { MockCustomerGateway } from "@/data/usecases/mock-customer-gateway";
import { RemoteCustomerGateway } from "@/data/usecases/remote-customer-gateway";
import type { CustomerGateway } from "@/domain/usecases/customer-gateway";
import { apiUrl, isMockEnvironment } from "@/main/connectors/runtime-environment";

export function makeCustomerGateway(): CustomerGateway {
  return isMockEnvironment()
    ? new MockCustomerGateway()
    : new RemoteCustomerGateway(apiUrl());
}

import { RemoteUsersGateway } from "@/data/usecases/remote-users-gateway";
import { apiUrl } from "@/main/connectors/runtime-environment";

// Users always use the backend; NEXT_PUBLIC_USE_MOCK controls the other modules.
export function makeUsersGateway(): RemoteUsersGateway {
  return new RemoteUsersGateway(apiUrl());
}

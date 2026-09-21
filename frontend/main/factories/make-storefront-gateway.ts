import { RemoteCustomerSelfGateway } from "@/data/usecases/remote-customer-self-gateway";
import { RemoteStorefrontGateway } from "@/data/usecases/remote-storefront-gateway";
import type { StorefrontGateway } from "@/domain/usecases/storefront-gateway";
import { apiUrl } from "@/main/connectors/runtime-environment";

export function makeStorefrontGateway(): StorefrontGateway {
  const gateway = new RemoteStorefrontGateway(apiUrl());
  const customers = new RemoteCustomerSelfGateway(apiUrl());
  return Object.assign(gateway, {
    profile: customers.profile.bind(customers),
    completeProfile: customers.completeProfile.bind(customers),
    updateProfile: customers.updateProfile.bind(customers),
    inactivateProfile: customers.inactivateProfile.bind(customers),
    addAddress: customers.addAddress.bind(customers),
    updateAddress: customers.updateAddress.bind(customers),
    deleteAddress: customers.deleteAddress.bind(customers),
    addCard: customers.addCard.bind(customers),
    updateCard: customers.updateCard.bind(customers),
    deleteCard: customers.deleteCard.bind(customers),
  });
}

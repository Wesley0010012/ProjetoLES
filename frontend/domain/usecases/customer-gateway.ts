import type {
  Customer,
  CustomerAddress,
  CustomerAddressPayload,
  CustomerCard,
  CustomerCardPayload,
  CustomerPayload,
} from "@/domain/models/customer";

export interface CustomerGateway {
  list(): Promise<Customer[]>;
  findById(id: number): Promise<Customer>;
  create(payload: CustomerPayload): Promise<Customer>;
  update(id: number, payload: CustomerPayload): Promise<Customer>;
  delete(id: number): Promise<void>;
  listAddresses(customerId: number): Promise<CustomerAddress[]>;
  addAddress(
    customerId: number,
    payload: CustomerAddressPayload,
  ): Promise<CustomerAddress>;
  updateAddress(
    customerId: number,
    id: number,
    payload: CustomerAddressPayload,
  ): Promise<CustomerAddress>;
  deleteAddress(customerId: number, id: number): Promise<void>;
  listCards(customerId: number): Promise<CustomerCard[]>;
  addCard(customerId: number, payload: CustomerCardPayload): Promise<CustomerCard>;
  deleteCard(customerId: number, id: number): Promise<void>;
}

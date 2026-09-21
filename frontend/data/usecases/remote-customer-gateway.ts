import { requestJson } from "@/data/http/request-json";
import type {
  Customer,
  CustomerAddress,
  CustomerAddressPayload,
  CustomerCard,
  CustomerCardPayload,
  CustomerPayload,
} from "@/domain/models/customer";
import type { CustomerGateway } from "@/domain/usecases/customer-gateway";

export class RemoteCustomerGateway implements CustomerGateway {
  public constructor(private readonly apiUrl: string) {}

  public list(): Promise<Customer[]> {
    return this.request("/admin/customers?orderBy=name&orderDirection=ASC");
  }

  public findById(id: number): Promise<Customer> {
    return this.request(`/admin/customers/${id}`);
  }

  public update(id: number, payload: CustomerPayload): Promise<Customer> {
    return this.request(`/admin/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  public async delete(id: number): Promise<void> {
    await this.request(`/admin/customers/${id}`, {
      method: "DELETE",
    });
  }

  public listAddresses(customerId: number): Promise<CustomerAddress[]> {
    return this.request(`/admin/customers/${customerId}/addresses`);
  }

  public addAddress(
    customerId: number,
    payload: CustomerAddressPayload,
  ): Promise<CustomerAddress> {
    return this.request(`/admin/customers/${customerId}/addresses`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  public updateAddress(
    customerId: number,
    id: number,
    payload: CustomerAddressPayload,
  ): Promise<CustomerAddress> {
    return this.request(`/admin/customers/${customerId}/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  public async deleteAddress(customerId: number, id: number): Promise<void> {
    await this.request(`/admin/customers/${customerId}/addresses/${id}`, {
      method: "DELETE",
    });
  }

  public listCards(customerId: number): Promise<CustomerCard[]> {
    return this.request(`/admin/customers/${customerId}/cards`);
  }

  public addCard(
    customerId: number,
    payload: CustomerCardPayload,
  ): Promise<CustomerCard> {
    return this.request(`/admin/customers/${customerId}/cards`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async deleteCard(customerId: number, id: number): Promise<void> {
    await this.request(`/admin/customers/${customerId}/cards/${id}`, {
      method: "DELETE",
    });
  }

  private request<T>(path: string, init: RequestInit = {}): Promise<T> {
    return requestJson<T>(`${this.apiUrl}${path}`, init, {
      errorMessage: "Não foi possível concluir a operação com o cliente.",
    });
  }
}

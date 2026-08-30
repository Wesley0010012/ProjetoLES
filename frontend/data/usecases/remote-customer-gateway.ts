import { getAuthenticationToken } from "@/data/http/get-authentication-token";
import { getBackendErrorMessage } from "@/data/http/get-backend-error-message";
import { redirectOnAuthenticationError } from "@/data/http/redirect-on-authentication-error";
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

  public create(payload: CustomerPayload): Promise<Customer> {
    return this.request("/admin/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
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

  private async request<Response>(
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${getAuthenticationToken()}`,
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });

    if (!response.ok) {
      redirectOnAuthenticationError(response);
      throw new Error(
        await getBackendErrorMessage(
          response,
          "Não foi possível concluir a operação com o cliente.",
        ),
      );
    }

    return response.status === 204
      ? (undefined as Response)
      : ((await response.json()) as Response);
  }
}

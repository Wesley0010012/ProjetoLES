import { getAuthenticationToken } from "@/data/http/get-authentication-token";
import { getBackendErrorMessage } from "@/data/http/get-backend-error-message";
import { redirectOnAuthenticationError } from "@/data/http/redirect-on-authentication-error";
import type {
  StockBook,
  StockEntryPayload,
  StockItem,
  StockQuantityPayload,
  StockSupplier,
} from "@/domain/models/stock";
import type { StockGateway } from "@/domain/usecases/stock-gateway";

export class RemoteStockGateway implements StockGateway {
  public constructor(private readonly apiUrl: string) {}

  public list(): Promise<StockItem[]> {
    return this.request("/admin/stock");
  }

  public listBooks(): Promise<StockBook[]> {
    return this.request("/admin/books?orderBy=title&orderDirection=ASC");
  }

  public listSuppliers(): Promise<StockSupplier[]> {
    return this.request("/admin/stock/suppliers");
  }

  public addSupplier(name: string, document: string): Promise<StockSupplier> {
    return this.request("/admin/stock/suppliers", {
      method: "POST",
      body: JSON.stringify({ name, document }),
    });
  }

  public async deleteSupplier(id: number): Promise<void> {
    await this.request(`/admin/stock/suppliers/${id}`, {
      method: "DELETE",
    });
  }

  public enter(payload: StockEntryPayload): Promise<StockItem> {
    return this.request("/admin/stock/entries", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async withdraw(payload: StockQuantityPayload): Promise<void> {
    await this.request("/admin/stock/withdrawals", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async reenter(payload: StockQuantityPayload): Promise<void> {
    await this.request("/admin/stock/reentries", {
      method: "POST",
      body: JSON.stringify(payload),
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
          "Não foi possível concluir a operação de estoque.",
        ),
      );
    }

    return response.status === 204
      ? (undefined as Response)
      : ((await response.json()) as Response);
  }
}

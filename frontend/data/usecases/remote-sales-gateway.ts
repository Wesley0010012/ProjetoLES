import { requestJson } from "@/data/http/request-json";
import type { Exchange, Sale, SalesSeries } from "@/domain/models/sales";
import type { SalesGateway, SalesPage } from "@/domain/usecases/sales-gateway";

export class RemoteSalesGateway implements SalesGateway {
  public constructor(private readonly apiUrl: string) {}

  public listPage(page: number, pageSize: number): Promise<SalesPage<Sale>> {
    return this.request(
      `/admin/sales?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) })}`,
    );
  }

  public exchangesPage(page: number, pageSize: number): Promise<SalesPage<Exchange>> {
    return this.request(
      `/admin/sales/exchanges?${new URLSearchParams({ page: String(page), pageSize: String(pageSize) })}`,
    );
  }

  public list(): Promise<Sale[]> {
    return this.request("/admin/sales");
  }

  public listByCustomer(customerId: number): Promise<Sale[]> {
    return this.request(`/admin/sales/customer/${customerId}`);
  }

  public async process(id: number): Promise<void> {
    await this.request(`/admin/sales/${id}/process`, { method: "POST" });
  }

  public async confirmPayment(id: number): Promise<void> {
    await this.request(`/admin/sales/${id}/payment`, { method: "POST" });
  }

  public async dispatch(id: number): Promise<void> {
    await this.request(`/admin/sales/${id}/dispatch`, { method: "POST" });
  }

  public async deliver(id: number): Promise<void> {
    await this.request(`/admin/sales/${id}/deliver`, { method: "POST" });
  }

  public exchanges(): Promise<Exchange[]> {
    return this.request("/admin/sales/exchanges");
  }

  public async authorizeExchange(id: number, observation: string): Promise<void> {
    await this.request(`/admin/sales/exchanges/${id}/authorize`, {
      method: "POST",
      body: JSON.stringify({ observation }),
    });
  }

  public async rejectExchange(id: number, observation: string): Promise<void> {
    await this.request(`/admin/sales/exchanges/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ observation }),
    });
  }

  public async markExchangeReceived(id: number): Promise<void> {
    await this.request(`/admin/sales/exchanges/${id}/arrival`, { method: "POST" });
  }
  public receiveExchange(
    id: number,
    returnToStock: boolean,
    receivedAt: string,
  ): Promise<{ code: string; value: number }> {
    return this.request(`/admin/sales/exchanges/${id}/receive`, {
      method: "POST",
      body: JSON.stringify({ returnToStock, receivedAt }),
    });
  }

  public analyze(
    startDate: string,
    endDate: string,
    groupBy: "PRODUCT" | "CATEGORY",
  ): Promise<SalesSeries[]> {
    const query = new URLSearchParams({ startDate, endDate, groupBy });
    return this.request(`/admin/sales/analysis?${query}`);
  }

  private request<T>(path: string, init: RequestInit = {}): Promise<T> {
    return requestJson<T>(`${this.apiUrl}${path}`, init, {
      errorMessage: "Não foi possível concluir a operação de venda.",
    });
  }
}

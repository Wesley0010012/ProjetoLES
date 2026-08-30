import { getAuthenticationToken } from "@/data/http/get-authentication-token";
import { getBackendErrorMessage } from "@/data/http/get-backend-error-message";
import { redirectOnAuthenticationError } from "@/data/http/redirect-on-authentication-error";
import type {
  Coupon,
  CouponPayload,
  Exchange,
  Sale,
  SalesSeries,
} from "@/domain/models/sales";
import type { SalesGateway } from "@/domain/usecases/sales-gateway";

export class RemoteSalesGateway implements SalesGateway {
  public constructor(private readonly apiUrl: string) {}

  public list(): Promise<Sale[]> {
    return this.request("/admin/sales");
  }

  public listByCustomer(customerId: number): Promise<Sale[]> {
    return this.request(`/admin/sales/customer/${customerId}`);
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

  public coupons(): Promise<Coupon[]> {
    return this.request("/admin/sales/coupons");
  }

  public createCoupon(payload: CouponPayload): Promise<{ id: number; code: string }> {
    return this.request("/admin/sales/coupons", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async deactivateCoupon(id: number): Promise<void> {
    await this.request(`/admin/sales/coupons/${id}`, { method: "DELETE" });
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
          "Não foi possível concluir a operação de venda.",
        ),
      );
    }
    return response.status === 204
      ? (undefined as Response)
      : ((await response.json()) as Response);
  }
}

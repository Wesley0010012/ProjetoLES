import { getAuthenticationToken } from "@/data/http/get-authentication-token";
import { getBackendErrorMessage } from "@/data/http/get-backend-error-message";
import { redirectOnAuthenticationError } from "@/data/http/redirect-on-authentication-error";
import type {
  CustomerCart,
  CustomerOrder,
  SelfProfile,
  StoreProduct,
  AssistantChatMessage,
  AssistantResponse,
} from "@/domain/models/storefront";
import type { CustomerCoupon } from "@/domain/models/storefront";
import type { StorefrontGateway } from "@/domain/usecases/storefront-gateway";

export class RemoteStorefrontGateway implements StorefrontGateway {
  public constructor(private readonly apiUrl: string) {}

  public products(query?: string, category?: string): Promise<StoreProduct[]> {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (category) params.set("category", category);
    return this.publicRequest(`/storefront/products?${params}`);
  }
  public product(id: number): Promise<StoreProduct | null> {
    return this.publicRequest(`/storefront/products/${id}`);
  }
  public categories(): Promise<string[]> {
    return this.publicRequest("/storefront/categories");
  }
  public publicRecommendations(context: string): Promise<StoreProduct[]> {
    return this.publicRequest(`/storefront/recommendations?context=${context}`);
  }
  public recommendations(context: string): Promise<StoreProduct[]> {
    return this.authRequest(`/customer/recommendations?context=${context}`);
  }
  public profile(): Promise<SelfProfile> {
    return this.authRequest("/customer/me");
  }
  public async completeProfile(payload: Record<string, unknown>): Promise<void> {
    await this.authRequest("/customer/me/complete", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  public async updateProfile(payload: Record<string, unknown>): Promise<void> {
    await this.authRequest("/customer/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
  public async inactivateProfile(): Promise<void> {
    await this.authRequest("/customer/me", { method: "DELETE" });
  }
  public async addAddress(payload: Record<string, unknown>): Promise<void> {
    await this.authRequest("/customer/me/addresses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  public async updateAddress(
    id: number,
    payload: Record<string, unknown>,
  ): Promise<void> {
    await this.authRequest(`/customer/me/addresses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
  public async deleteAddress(id: number): Promise<void> {
    await this.authRequest(`/customer/me/addresses/${id}`, { method: "DELETE" });
  }
  public async addCard(payload: Record<string, unknown>): Promise<void> {
    await this.authRequest("/customer/me/cards", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  public async updateCard(id: number, payload: Record<string, unknown>): Promise<void> {
    await this.authRequest(`/customer/me/cards/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }
  public async deleteCard(id: number): Promise<void> {
    await this.authRequest(`/customer/me/cards/${id}`, { method: "DELETE" });
  }
  public async changePassword(
    currentPassword: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<void> {
    await this.authRequest("/customer/me/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, password, passwordConfirmation }),
    });
  }
  public cart(): Promise<CustomerCart> {
    return this.authRequest("/customer/cart");
  }
  public addToCart(bookId: number, quantity: number): Promise<CustomerCart> {
    return this.authRequest("/customer/cart/items", {
      method: "POST",
      body: JSON.stringify({ bookId, quantity }),
    });
  }
  public updateCart(bookId: number, quantity: number): Promise<CustomerCart> {
    return this.authRequest(`/customer/cart/items/${bookId}`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    });
  }
  public removeFromCart(bookId: number): Promise<CustomerCart> {
    return this.authRequest(`/customer/cart/items/${bookId}`, { method: "DELETE" });
  }
  public checkout(payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    return this.authRequest("/customer/checkout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
  public orders(): Promise<CustomerOrder[]> {
    return this.authRequest("/customer/orders");
  }
  public async confirmReceipt(saleId: number): Promise<void> {
    await this.authRequest(`/customer/orders/${saleId}/receipt`, { method: "POST" });
  }
  public async cancelOrder(saleId: number): Promise<void> {
    await this.authRequest(`/customer/orders/${saleId}/cancel`, { method: "POST" });
  }
  public requestExchange(
    saleId: number,
    items: { bookId: number; quantity: number }[],
    reason: string,
  ): Promise<{ id: number; code: string }> {
    return this.authRequest("/customer/exchanges", {
      method: "POST",
      body: JSON.stringify({ saleId, items, reason }),
    });
  }
  public async dispatchExchange(saleId: number): Promise<void> {
    await this.authRequest(`/customer/exchanges/${saleId}/dispatch`, { method: "POST" });
  }
  public coupons(): Promise<CustomerCoupon[]> {
    return this.authRequest("/customer/coupons");
  }
  public askAssistant(
    message: string,
    history: AssistantChatMessage[],
  ): Promise<AssistantResponse> {
    return this.publicRequest("/assistant/messages", {
      method: "POST",
      body: JSON.stringify({ message, history }),
    });
  }

  private async publicRequest<Response>(
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    return this.request(path, init, false);
  }
  private async authRequest<Response>(
    path: string,
    init: RequestInit = {},
  ): Promise<Response> {
    return this.request(path, init, true);
  }
  private async request<Response>(
    path: string,
    init: RequestInit,
    authenticated: boolean,
  ): Promise<Response> {
    const response = await fetch(`${this.apiUrl}${path}`, {
      ...init,
      headers: {
        ...(authenticated
          ? { Authorization: `Bearer ${getAuthenticationToken("USER")}` }
          : {}),
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
    if (!response.ok) {
      if (authenticated) redirectOnAuthenticationError(response);
      throw new Error(
        await getBackendErrorMessage(response, "Não foi possível concluir a operação."),
      );
    }
    return response.status === 204
      ? (undefined as Response)
      : ((await response.json()) as Response);
  }
}

import { requestJson } from "@/data/http/request-json";
import type {
  AssistantChatMessage,
  AssistantResponse,
  CustomerCart,
  CustomerCoupon,
  CustomerOrder,
  SelfProfile,
  StoreProduct,
} from "@/domain/models/storefront";
import type { StorefrontGateway } from "@/domain/usecases/storefront-gateway";

type ProductBookDto = Omit<StoreProduct, "authors" | "categories" | "editors"> & {
  authors: { id?: number; name: string }[];
  categories: { id?: number; name: string }[];
  editors: { id?: number; name: string }[];
};

export class RemoteStorefrontGateway implements StorefrontGateway {
  public constructor(private readonly apiUrl: string) {}

  public async products(query?: string, category?: string): Promise<StoreProduct[]> {
    const params = new URLSearchParams();
    if (query) params.set("query", query);
    if (category) params.set("category", category);
    const suffix = params.size > 0 ? `?${params.toString()}` : "";
    const products = await this.publicRequest<ProductBookDto[]>(`/books${suffix}`);
    return products.map((product) => this.toStoreProduct(product));
  }

  public async product(id: number): Promise<StoreProduct | null> {
    const product = await this.publicRequest<ProductBookDto | null>(`/books/${id}`);
    return product ? this.toStoreProduct(product) : null;
  }

  public async categories(): Promise<string[]> {
    const categories = await this.publicRequest<{ id: number; name: string }[]>(
      "/categories",
    );
    return categories.map((category) => category.name);
  }

  public async recommendations(context: string): Promise<StoreProduct[]> {
    const products = await this.authRequest<ProductBookDto[]>(
      `/customer/recommendations?context=${encodeURIComponent(context)}`,
    );
    return products.map((product) => this.toStoreProduct(product));
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
    await this.authRequest(`/customer/orders/${saleId}/receipt`, {
      method: "POST",
    });
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
    await this.authRequest(`/customer/exchanges/${saleId}/dispatch`, {
      method: "POST",
    });
  }

  public coupons(): Promise<CustomerCoupon[]> {
    return this.authRequest("/customer/coupons");
  }

  public askAssistant(
    message: string,
    _history: AssistantChatMessage[],
  ): Promise<AssistantResponse> {
    return this.authRequest("/assistant/messages", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }

  private toStoreProduct(product: ProductBookDto): StoreProduct {
    return {
      ...product,
      authors: product.authors.map((author) => author.name),
      categories: product.categories.map((category) => category.name),
      editors: product.editors.map((editor) => editor.name),
    };
  }

  private publicRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    return requestJson<T>(`${this.apiUrl}${path}`, init, { role: null });
  }

  private authRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    return requestJson<T>(`${this.apiUrl}${path}`, init, { role: "USER" });
  }
}

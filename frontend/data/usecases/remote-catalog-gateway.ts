import { getBackendErrorMessage } from "@/data/http/get-backend-error-message";
import { getAuthenticationToken } from "@/data/http/get-authentication-token";
import type {
  BookRelation,
  CatalogEntity,
  CatalogPayload,
  CatalogResource,
} from "@/domain/models/catalog";
import type { CatalogGateway } from "@/domain/usecases/catalog-gateway";
import { redirectOnAuthenticationError } from "@/data/http/redirect-on-authentication-error";

export class RemoteCatalogGateway implements CatalogGateway {
  public constructor(private readonly apiUrl: string) {}

  public async list(resource: CatalogResource): Promise<CatalogEntity[]> {
    return this.request<CatalogEntity[]>(
      `/admin/${resource}?orderBy=${this.orderField(resource)}&orderDirection=ASC`,
    );
  }

  public async findById(resource: CatalogResource, id: number): Promise<CatalogEntity> {
    return this.request<CatalogEntity>(`/admin/${resource}/${id}`);
  }

  public async create(
    resource: CatalogResource,
    payload: CatalogPayload,
  ): Promise<CatalogEntity> {
    return this.request<CatalogEntity>(`/admin/${resource}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  public async update(
    resource: CatalogResource,
    id: number,
    payload: CatalogPayload,
  ): Promise<CatalogEntity> {
    return this.request<CatalogEntity>(`/admin/${resource}/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  public async delete(resource: CatalogResource, id: number): Promise<void> {
    await this.request<void>(`/admin/${resource}/${id}`, {
      method: "DELETE",
    });
  }

  public async addBookRelation(
    bookId: number,
    relation: BookRelation,
    relatedId: number,
  ): Promise<void> {
    await this.request<void>(`/admin/books/${bookId}/${relation}/${relatedId}`, {
      method: "POST",
    });
  }

  public async removeBookRelation(
    bookId: number,
    relation: BookRelation,
    relatedId: number,
  ): Promise<void> {
    await this.request<void>(`/admin/books/${bookId}/${relation}/${relatedId}`, {
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
        ...init.headers,
      },
    });

    if (!response.ok) {
      redirectOnAuthenticationError(response);

      throw new Error(
        await getBackendErrorMessage(response, "Não foi possível concluir a operação."),
      );
    }

    if (response.status === 204) {
      return undefined as Response;
    }

    return (await response.json()) as Response;
  }

  private orderField(resource: CatalogResource): string {
    return resource === "books" ? "title" : "name";
  }
}

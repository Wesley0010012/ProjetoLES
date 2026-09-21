import { requestJson } from "@/data/http/request-json";
import type { CatalogEntity, CatalogResource } from "@/domain/models/catalog";
import type { CatalogGateway } from "@/domain/usecases/catalog-gateway";

export class RemoteCatalogGateway implements CatalogGateway {
  public constructor(private readonly apiUrl: string) {}

  public async list(resource: CatalogResource): Promise<CatalogEntity[]> {
    return this.request<CatalogEntity[]>(
      `/admin/${resource}?orderBy=${this.orderField(resource)}&orderDirection=ASC`,
    );
  }

  private request<T>(path: string, init: RequestInit = {}): Promise<T> {
    return requestJson<T>(`${this.apiUrl}${path}`, init);
  }

  private orderField(resource: CatalogResource): string {
    return resource === "books" ? "title" : "name";
  }
}

import type { CatalogResource } from "@/domain/models/catalog";

const booksModulePath = "/admin/books";

export function catalogListPath(resource: CatalogResource): string {
  return `${booksModulePath}/${resource}`;
}

export function catalogCreatePath(resource: CatalogResource): string {
  return `${catalogListPath(resource)}/new`;
}

export function catalogEditPath(resource: CatalogResource, id: number): string {
  return `${catalogListPath(resource)}/${id}/edit`;
}

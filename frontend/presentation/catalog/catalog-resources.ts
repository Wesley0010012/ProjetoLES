import type { CatalogResource } from "@/domain/models/catalog";

export type CatalogResourceDefinition = {
  resource: CatalogResource;
  singular: string;
  plural: string;
  description: string;
};

export const catalogResources: CatalogResourceDefinition[] = [
  {
    resource: "books",
    singular: "Livro",
    plural: "Livros",
    description: "Catálogo, dados editoriais e relacionamentos.",
  },
  {
    resource: "authors",
    singular: "Autor",
    plural: "Autores",
    description: "Autores disponíveis para associação aos livros.",
  },
  {
    resource: "categories",
    singular: "Categoria",
    plural: "Categorias",
    description: "Classificações utilizadas na organização do catálogo.",
  },
  {
    resource: "editors",
    singular: "Editora",
    plural: "Editoras",
    description: "Editoras responsáveis pelas publicações.",
  },
  {
    resource: "precification-groups",
    singular: "Grupo de precificação",
    plural: "Grupos de precificação",
    description: "Margens aplicadas ao cálculo dos preços de venda.",
  },
];

export function findCatalogResource(
  resource: string,
): CatalogResourceDefinition | undefined {
  return catalogResources.find((item) => item.resource === resource);
}

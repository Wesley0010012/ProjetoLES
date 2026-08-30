export type CatalogResource =
  "authors" | "categories" | "editors" | "precification-groups" | "books";

export type NamedEntity = {
  id: number;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type PrecificationGroup = NamedEntity & {
  profitMarginPercentage: number;
};

export type Book = {
  id: number;
  code: string;
  authors: NamedEntity[];
  categories: NamedEntity[];
  year: number;
  title: string;
  editors: NamedEntity[];
  edition: string;
  isbn: string;
  numberOfPages: number;
  synopsis: string;
  dimensions: {
    height: number;
    width: number;
    weight: number;
    depth: number;
  };
  precificationGroup: PrecificationGroup;
  barcode: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CatalogEntity = NamedEntity | PrecificationGroup | Book;

export type CatalogPayload = Record<string, unknown>;

export type BookRelation = "authors" | "categories" | "editors";

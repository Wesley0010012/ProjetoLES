import products from './catalog-seed.json';
import { Book } from 'src/books/domain/entities/Book';
import { Author } from 'src/books/domain/entities/Author';
import { Category } from 'src/books/domain/entities/Category';
import { Editor } from 'src/books/domain/entities/Editor';
import { PrecificationGroup } from 'src/books/domain/entities/PrecificationGroup';
import { Dimensions } from 'src/books/domain/vo/Dimensions';
export const AUTHORS_SEED = [
  ...new Set(products.flatMap((p) => p.authors)),
].map((name, i) => new Author({ name }, i + 1));
export const CATEGORIES_SEED = [
  ...new Set(products.flatMap((p) => p.categories)),
].map((name, i) => new Category({ name }, i + 1));
export const EDITORS_SEED = [
  ...new Set(products.flatMap((p) => p.editors)),
].map((name, i) => new Editor({ name }, i + 1));
export const PRECIFICATION_GROUPS_SEED = [
  new PrecificationGroup({ name: 'Padrão', profitMarginPercentage: 35 }, 1),
  new PrecificationGroup(
    { name: 'Especializada', profitMarginPercentage: 40 },
    2,
  ),
  new PrecificationGroup(
    { name: 'Promocional', profitMarginPercentage: 20 },
    3,
  ),
];
export const BOOKS_SEED = products.map(
  (p) =>
    new Book(
      {
        code: p.code,
        title: p.title,
        year: p.year,
        edition: p.edition,
        isbn: p.isbn,
        numberOfPages: p.numberOfPages,
        synopsis: p.synopsis,
        barcode: p.barcode,
        defaultPrice: p.price,
        coverImage: `/images/books/${p.coverImage.split('/').pop()}`,
        dimensions: new Dimensions(p.dimensions),
        authors: AUTHORS_SEED.filter((a) => p.authors.includes(a.name)),
        categories: CATEGORIES_SEED.filter((a) =>
          p.categories.includes(a.name),
        ),
        editors: EDITORS_SEED.filter((a) => p.editors.includes(a.name)),
        precificationGroup: PRECIFICATION_GROUPS_SEED.find(
          (g) => g.id === p.precificationGroup.id,
        )!,
      },
      p.id,
    ),
);

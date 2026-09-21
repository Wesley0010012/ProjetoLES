import { Search, SearchProps } from 'src/shared/domain/repositories/Search';
import { Book } from '../domain/entities/Book';

export type BookSearchProps = SearchProps & {
  query?: string;
  category?: string;
};

/** Critérios de busca do catálogo de livros: texto livre e categoria. */
export class BookSearch extends Search {
  public readonly query?: string;
  public readonly category?: string;

  public constructor(props: BookSearchProps = {}) {
    super(props);
    this.query = props.query?.trim() || undefined;
    this.category = props.category?.trim() || undefined;
  }

  public matches(book: Book): boolean {
    const query = this.query?.toLocaleLowerCase('pt-BR');
    const category = this.category?.toLocaleLowerCase('pt-BR');

    const matchesQuery =
      !query ||
      [
        book.title,
        book.isbn,
        book.code,
        ...book.authors.map((author) => author.name),
      ].some((value) => value.toLocaleLowerCase('pt-BR').includes(query));

    const matchesCategory =
      !category ||
      book.categories.some(
        (item) => item.name.toLocaleLowerCase('pt-BR') === category,
      );

    return matchesQuery && matchesCategory;
  }
}

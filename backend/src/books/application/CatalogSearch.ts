import { Search, SearchProps } from 'src/shared/domain/repositories/Search';

/** Busca simples sobre entidades do catálogo (categorias, autores, editoras...). */
export class CatalogSearch extends Search {
  public constructor(props: SearchProps = {}) {
    super(props);
  }
}

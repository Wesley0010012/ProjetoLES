import { Search, SearchProps } from 'src/shared/domain/repositories/Search';

export class StockSearch extends Search {
  public constructor(props: SearchProps = {}) {
    super(props);
  }
}

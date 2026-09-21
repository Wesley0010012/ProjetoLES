import { Search, SearchProps } from 'src/shared/domain/repositories/Search';

export class CustomerSearch extends Search {
  public constructor(props: SearchProps = {}) {
    super(props);
  }
}

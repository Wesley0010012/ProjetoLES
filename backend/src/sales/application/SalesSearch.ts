import { Search, SearchProps } from 'src/shared/domain/repositories/Search';

export class SalesSearch extends Search {
  public readonly customerId?: number;
  public constructor(props: SearchProps & { customerId?: number } = {}) {
    super(props);
    this.customerId = props.customerId;
  }
}

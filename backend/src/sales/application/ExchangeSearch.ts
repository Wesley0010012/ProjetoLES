import { Search, SearchProps } from 'src/shared/domain/repositories/Search';
import { ExchangeStatus } from '../domain/enums/ExchangeStatus';

export type ExchangeSearchProps = SearchProps & {
  saleId?: number;
  status?: ExchangeStatus;
};

export class ExchangeSearch extends Search {
  public readonly saleId?: number;
  public readonly status?: ExchangeStatus;

  public constructor(props: ExchangeSearchProps = {}) {
    super(props);
    this.saleId = props.saleId;
    this.status = props.status;
  }
}

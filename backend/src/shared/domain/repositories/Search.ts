import { OrderDirection } from '../enums/OrderDirection';

export type SearchProps = {
  orderBy?: string;
  orderDirection?: OrderDirection;
  page?: number;
  pageSize?: number;
};

export abstract class Search {
  public readonly orderBy?: string;
  public readonly orderDirection: OrderDirection;
  public readonly page?: number;
  public readonly pageSize?: number;

  protected constructor(props: SearchProps = {}) {
    this.validatePagination(props.page, props.pageSize);

    if (props.orderBy !== undefined && props.orderBy.trim().length === 0) {
      throw new RangeError('orderBy cannot be blank');
    }

    if (
      props.orderDirection !== undefined &&
      !Object.values(OrderDirection).includes(props.orderDirection)
    ) {
      throw new RangeError('orderDirection is invalid');
    }

    this.orderBy = props.orderBy?.trim();
    this.orderDirection = props.orderDirection ?? OrderDirection.ASC;
    this.page = props.page;
    this.pageSize = props.pageSize;
  }

  public isPaginated(): boolean {
    return this.page !== undefined && this.pageSize !== undefined;
  }

  private validatePagination(page?: number, pageSize?: number): void {
    const receivedOnlyOnePaginationParameter =
      (page === undefined) !== (pageSize === undefined);

    if (receivedOnlyOnePaginationParameter) {
      throw new RangeError('page and pageSize must be provided together');
    }

    if (
      page !== undefined &&
      (!Number.isInteger(page) ||
        !Number.isInteger(pageSize) ||
        page < 1 ||
        pageSize! < 1)
    ) {
      throw new RangeError('page and pageSize must be positive integers');
    }
  }
}

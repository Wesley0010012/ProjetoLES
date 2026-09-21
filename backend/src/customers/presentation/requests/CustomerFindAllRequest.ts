import { CustomerSearch } from 'src/customers/application/CustomerSearch';
import { OrderDirection } from 'src/shared/domain/enums/OrderDirection';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { Request } from 'src/shared/presentation/requests/Request';

export class CustomerFindAllRequest extends Request {
  public readonly search: CustomerSearch;

  public constructor(data: unknown) {
    super(data);
    const orderBy = this.optionalString('orderBy');
    const orderDirection = this.optionalString('orderDirection');
    const page = this.optionalInteger('page');
    const pageSize = this.optionalInteger('pageSize');

    if (
      orderDirection !== undefined &&
      !Object.values(OrderDirection).includes(orderDirection as OrderDirection)
    ) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'orderDirection',
      });
    }

    if (
      (page === undefined) !== (pageSize === undefined) ||
      (page !== undefined && (page < 1 || pageSize! < 1))
    ) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'pagination',
      });
    }

    this.search = new CustomerSearch({
      orderBy,
      orderDirection: orderDirection as OrderDirection | undefined,
      page,
      pageSize,
    });
  }
}

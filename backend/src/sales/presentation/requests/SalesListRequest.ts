import { BadRequestException } from '@nestjs/common';
import { SalesSearch } from 'src/sales/application/SalesSearch';
import { OrderDirection } from 'src/shared/domain/enums/OrderDirection';
import { Request } from 'src/shared/presentation/requests/Request';

export class SalesListRequest extends Request {
  public constructor(query: unknown) {
    super(query);
  }
  public toSearch(customerId?: number, exchanges = false): SalesSearch {
    const page = this.optionalInteger('page');
    const pageSize = this.optionalInteger('pageSize');
    const orderBy =
      this.optionalString('orderBy') ??
      (exchanges ? 'requestedAt' : 'saleDate');
    const direction =
      this.optionalString('orderDirection') ?? OrderDirection.DESC;
    const allowed = exchanges
      ? ['id', 'code', 'requestedAt', 'status', 'total']
      : ['id', 'code', 'saleDate', 'status', 'total'];
    if (
      !allowed.includes(orderBy) ||
      !Object.values(OrderDirection).includes(direction as OrderDirection)
    ) {
      throw new BadRequestException('Ordenação inválida');
    }
    if (
      (page !== undefined && page < 1) ||
      (pageSize !== undefined && (pageSize < 1 || pageSize > 100))
    ) {
      throw new BadRequestException(
        'Página deve ser positiva e pageSize deve estar entre 1 e 100',
      );
    }
    const paginated = page !== undefined || pageSize !== undefined;
    return new SalesSearch({
      customerId,
      orderBy,
      orderDirection: direction as OrderDirection,
      page: paginated ? (page ?? 1) : undefined,
      pageSize: paginated ? (pageSize ?? 20) : undefined,
    });
  }
}

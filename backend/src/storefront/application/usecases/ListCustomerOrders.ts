import { EntityPageToEntityPageDto } from 'src/shared/application/protocols/mappers/EntityPageToEntityPageDto';
import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { FindAll } from 'src/shared/application/usecases/FindAll';
import { OrderDirection } from 'src/shared/domain/enums/OrderDirection';
import { ExchangeRequest } from 'src/sales/domain/entities/ExchangeRequest';
import { Sale } from 'src/sales/domain/entities/Sale';
import { SalesSearch } from 'src/sales/application/SalesSearch';
import { StorefrontSaleDto } from '../dto/StorefrontSaleDto';
import { ShoppingUseCase } from './ShoppingUseCase';

export class ListCustomerOrders extends ShoppingUseCase {
  public async execute(userId: number) {
    const customer = await this.customer(userId);
    const exchanges = (await this._exchanges.findAll(new SalesSearch()))
      .entities;
    const exchangesBySaleId = new Map<number, ExchangeRequest[]>();
    for (const exchange of exchanges) {
      exchangesBySaleId.set(exchange.sale.id, [
        ...(exchangesBySaleId.get(exchange.sale.id) ?? []),
        exchange,
      ]);
    }
    const mapper: EntityToOutputDto<Sale, StorefrontSaleDto> = {
      toDto: (sale) =>
        this._saleMapper.toDto(sale, exchangesBySaleId.get(sale.id) ?? []),
    };

    return new FindAll(
      this._sales,
      new EntityPageToEntityPageDto(mapper),
    ).execute(
      new SalesSearch({
        customerId: customer.id,
        orderBy: 'saleDate',
        orderDirection: OrderDirection.DESC,
      }),
    );
  }
}

import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';
import { ShoppingUseCase } from './ShoppingUseCase';

export class CancelOrder extends ShoppingUseCase {
  public async execute(userId: number, saleId: number) {
    const sale = await this.customerSale(userId, saleId);
    await this._rules.cancellableSale.validate(sale);

    for (const item of sale.items) {
      const balance = await this._balances.findByBookId(item.book.id);
      if (!balance) continue;
      balance.add(item.quantity);
      await this._balances.update(balance);
    }

    sale.status = SaleStatus.CANCELLED;
    await this._sales.update(sale);
  }
}

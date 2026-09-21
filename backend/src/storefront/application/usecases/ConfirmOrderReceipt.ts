import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';
import { ShoppingUseCase } from './ShoppingUseCase';

export class ConfirmOrderReceipt extends ShoppingUseCase {
  public async execute(userId: number, saleId: number): Promise<void> {
    await this.customerSale(userId, saleId);
    await this._updateSaleStatus.execute(saleId, SaleStatus.DELIVERED);
  }
}

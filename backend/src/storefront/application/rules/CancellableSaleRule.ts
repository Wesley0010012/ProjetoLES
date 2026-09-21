import { Sale } from 'src/sales/domain/entities/Sale';
import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';
import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';

export class CancellableSaleRule implements Rule<Sale> {
  public validate(sale: Sale): Promise<void> {
    const canCancel = [
      SaleStatus.OPEN,
      SaleStatus.PROCESSING,
      SaleStatus.PAID,
    ].includes(sale.status);

    if (!canCancel) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'status' });
    }

    return Promise.resolve();
  }
}

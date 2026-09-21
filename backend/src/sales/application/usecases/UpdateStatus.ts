import { FindRequiredEntity } from 'src/shared/application/usecases/FindRequiredEntity';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { SaleStatus } from '../../domain/enums/SaleStatus';
import { SaleRepository } from '../../domain/repositories/SaleRepository';

const nextStatus: Partial<Record<SaleStatus, SaleStatus>> = {
  [SaleStatus.OPEN]: SaleStatus.PROCESSING,
  [SaleStatus.PROCESSING]: SaleStatus.PAID,
  [SaleStatus.PAID]: SaleStatus.IN_TRANSIT,
  [SaleStatus.IN_TRANSIT]: SaleStatus.DELIVERED,
};

export class UpdateStatus {
  public constructor(private readonly sales: SaleRepository) {}

  public async execute(id: number, target: SaleStatus): Promise<void> {
    const sale = await new FindRequiredEntity(this.sales).execute(id);
    const next = nextStatus[sale.status];
    if (!next || next !== target) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'status' });
    }
    sale.status = target;
    await this.sales.update(sale);
  }
}

import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { Request } from 'src/shared/presentation/requests/Request';

export class SalesAnalysisRequest extends Request {
  public readonly startDate: Date;
  public readonly endDate: Date;
  public readonly groupBy: 'PRODUCT' | 'CATEGORY';

  public constructor(data: unknown) {
    super(data);
    this.startDate = new Date(this.string('startDate'));
    this.endDate = new Date(this.string('endDate'));
    this.groupBy = this.enumValue('groupBy', ['PRODUCT', 'CATEGORY'] as const);

    if (
      Number.isNaN(this.startDate.getTime()) ||
      Number.isNaN(this.endDate.getTime()) ||
      this.startDate > this.endDate
    ) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'period' });
    }
    this.endDate.setUTCHours(23, 59, 59, 999);
  }
}

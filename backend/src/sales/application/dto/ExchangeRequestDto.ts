import { OutputDto } from 'src/shared/application/dto/output/OutputDto';
import { ExchangeStatus } from '../../domain/enums/ExchangeStatus';

export type ExchangeRequestItemDto = {
  bookId: number;
  title: string;
  quantity: number;
  unitPrice: number;
};

export type ExchangeRequestCouponDto = {
  code: string;
  value: number;
};

export class ExchangeRequestDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly reason: string,
    public readonly reviewObservation: string,
    public readonly code: string,
    public readonly saleId: number,
    public readonly saleCode: string,
    public readonly customer: string,
    public readonly items: ExchangeRequestItemDto[],
    public readonly status: ExchangeStatus,
    public readonly requestedAt: Date,
    public readonly receivedAt: Date | undefined,
    public readonly returnToStock: boolean | undefined,
    public readonly coupon: ExchangeRequestCouponDto | undefined,
    public readonly total: number,
  ) {
    super();
  }
}

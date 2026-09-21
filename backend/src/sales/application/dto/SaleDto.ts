import { OutputDto } from 'src/shared/application/dto/output/OutputDto';
import { SaleStatus } from '../../domain/enums/SaleStatus';

export type SaleItemDto = {
  bookId: number;
  code: string;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type SaleCustomerDto = {
  id: number;
  code: string;
  name: string;
};

export type SalePaymentDto = {
  label: string;
  amount: number;
};

export class SaleDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly deliveryAddress: string | undefined,
    public readonly coupons: string[],
    public readonly payments: SalePaymentDto[],
    public readonly code: string,
    public readonly customer: SaleCustomerDto,
    public readonly items: SaleItemDto[],
    public readonly status: SaleStatus,
    public readonly saleDate: Date,
    public readonly freight: number,
    public readonly total: number,
  ) {
    super();
  }
}

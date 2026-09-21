import { OutputDto } from 'src/shared/application/dto/output/OutputDto';
import type { Sale } from 'src/sales/domain/entities/Sale';
import { SaleStatus } from 'src/sales/domain/enums/SaleStatus';
import { ExchangeStatus } from 'src/sales/domain/enums/ExchangeStatus';

export type StorefrontSaleItemDto = {
  bookId: number;
  title: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type StorefrontSaleExchangeItemDto = {
  bookId: number;
  title: string;
  quantity: number;
};

export type StorefrontSaleExchangeDto = {
  code: string;
  reason: string;
  status: ExchangeStatus;
  items: StorefrontSaleExchangeItemDto[];
};

export class StorefrontSaleDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly deliveryAddress: Sale['deliveryAddress'],
    public readonly subtotal: number,
    public readonly discount: number,
    public readonly coupons: string[],
    public readonly payments: Sale['payments'],
    public readonly exchanges: StorefrontSaleExchangeDto[],
    public readonly code: string,
    public readonly status: SaleStatus,
    public readonly saleDate: Date,
    public readonly freight: number,
    public readonly total: number,
    public readonly items: StorefrontSaleItemDto[],
  ) {
    super();
  }
}

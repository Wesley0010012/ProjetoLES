import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { ExchangeStatus } from '../enums/ExchangeStatus';
import { SaleStatus } from '../enums/SaleStatus';
import { Coupon } from './Coupon';
import { Sale } from './Sale';
import { SaleItem } from './SaleItem';

export type ExchangeRequestProps = AbstractEntityProps & {
  reason?: string;
  reviewObservation?: string;
  code: string;
  sale: Sale;
  items: SaleItem[];
  status: ExchangeStatus;
  requestedAt: Date;
  receivedAt?: Date;
  returnToStock?: boolean;
  coupon?: Coupon;
};

export class ExchangeRequest extends AbstractEntity<ExchangeRequestProps> {
  public get code(): string {
    return this._props.code;
  }

  public get sale(): Sale {
    return this._props.sale;
  }

  public get items(): SaleItem[] {
    return [...this._props.items];
  }

  public get status(): ExchangeStatus {
    return this._props.status;
  }

  public get requestedAt(): Date {
    return this._props.requestedAt;
  }

  public get receivedAt(): Date | undefined {
    return this._props.receivedAt;
  }

  public get returnToStock(): boolean | undefined {
    return this._props.returnToStock;
  }

  public get coupon(): Coupon | undefined {
    return this._props.coupon;
  }

  public get reason() {
    return this._props.reason ?? '';
  }
  public get reviewObservation() {
    return this._props.reviewObservation ?? '';
  }
  public reject(observation: string): void {
    this._props.reviewObservation = observation;
    this._props.status = ExchangeStatus.REJECTED;
    if (this.sale.status === SaleStatus.IN_EXCHANGE)
      this.sale.status = SaleStatus.DELIVERED;
    this.touch();
  }
  public markArrived(): void {
    this._props.status = ExchangeStatus.ARRIVED;
    this.touch();
  }
  public dispatch(): void {
    this._props.status = ExchangeStatus.DISPATCHED;
    this.touch();
  }
  public authorize(observation = ''): void {
    this._props.reviewObservation = observation;
    this._props.status = ExchangeStatus.AUTHORIZED;
    this.touch();
  }

  public receive(
    receivedAt: Date,
    returnToStock: boolean,
    coupon: Coupon,
  ): void {
    this._props.status = ExchangeStatus.RECEIVED;
    this._props.receivedAt = receivedAt;
    this._props.returnToStock = returnToStock;
    this._props.coupon = coupon;
    if (this.isFullSaleExchange()) {
      this._props.sale.status = SaleStatus.EXCHANGED;
    }
    this.touch();
  }

  public get total(): number {
    return (
      Math.round(this.items.reduce((sum, item) => sum + item.total, 0) * 100) /
      100
    );
  }

  private isFullSaleExchange(): boolean {
    return (
      this.items.length === this.sale.items.length &&
      this.items.every((item) =>
        this.sale.items.some(
          (saleItem) =>
            saleItem.book.id === item.book.id &&
            saleItem.quantity === item.quantity,
        ),
      )
    );
  }
}

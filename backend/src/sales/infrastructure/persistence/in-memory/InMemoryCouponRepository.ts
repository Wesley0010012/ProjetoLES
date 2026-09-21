import { Coupon } from 'src/sales/domain/entities/Coupon';
import { CouponType } from 'src/sales/domain/enums/CouponType';
import { CouponRepository } from 'src/sales/domain/repositories/CouponRepository';
import { InMemoryAbstractEntityRepository } from 'src/shared/infrastructure/persistence/in-memory/InMemoryAbstractEntityRepository';
import { COUPONS_SEED } from './CouponSeed';

export class InMemoryCouponRepository
  extends InMemoryAbstractEntityRepository<Coupon>
  implements CouponRepository
{
  public constructor(coupons: Coupon[] = []) {
    super();
    this._entities.push(...coupons);
  }

  public nextCode(type: CouponType): string {
    const prefix = type === CouponType.EXCHANGE ? 'TROCA' : 'PROMO';
    return `${prefix}-${String(this.getNextId()).padStart(6, '0')}`;
  }

  public findByCode(code: string): Promise<Coupon | null> {
    return Promise.resolve(
      this._entities.find(
        (coupon) => coupon.code.toLowerCase() === code.toLowerCase(),
      ) ?? null,
    );
  }

  protected seed(): void {
    this._entities.push(...COUPONS_SEED);
  }
}

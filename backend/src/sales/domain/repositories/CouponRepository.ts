import { CrudRepository } from 'src/shared/domain/repositories/CrudRepository';
import { Coupon } from '../entities/Coupon';
import { CouponType } from '../enums/CouponType';

export interface CouponRepository extends CrudRepository<Coupon> {
  nextCode(type: CouponType): string;
  findByCode(code: string): Promise<Coupon | null>;
}

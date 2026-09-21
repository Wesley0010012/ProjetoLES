import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';

export type PrecificationGroupProps = AbstractEntityProps & {
  name: string;
  profitMarginPercentage: number;
};

export class PrecificationGroup extends AbstractEntity<PrecificationGroupProps> {
  public get name(): string {
    return this._props['name'];
  }

  public set name(name: string) {
    this._props['name'] = name;
  }

  public get profitMarginPercentage(): number {
    return this._props['profitMarginPercentage'];
  }

  public set profitMarginPercentage(profitMarginPercentage: number) {
    this._props['profitMarginPercentage'] = profitMarginPercentage;
  }
}

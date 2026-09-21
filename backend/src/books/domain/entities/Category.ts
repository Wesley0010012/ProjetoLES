import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';

export type CategoryProps = AbstractEntityProps & {
  name: string;
};

export class Category extends AbstractEntity<CategoryProps> {
  public get name(): string {
    return this._props['name'];
  }

  public set name(name: string) {
    this._props['name'] = name;
  }
}

import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';

export type SupplierProps = AbstractEntityProps & {
  name: string;
  document: string;
};

export class Supplier extends AbstractEntity<SupplierProps> {
  public get name(): string {
    return this._props.name;
  }

  public set name(name: string) {
    this._props.name = name;
  }

  public get document(): string {
    return this._props.document;
  }

  public set document(document: string) {
    this._props.document = document;
  }
}

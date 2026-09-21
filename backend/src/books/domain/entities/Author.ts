import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';

export type AuthorProps = AbstractEntityProps & {
  name: string;
};

export class Author extends AbstractEntity<AuthorProps> {
  public get name(): string {
    return this._props['name'];
  }

  public set name(name: string) {
    this._props['name'] = name;
  }
}

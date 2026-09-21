import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';

export type EditorProps = AbstractEntityProps & {
  name: string;
};

export class Editor extends AbstractEntity<EditorProps> {
  public get name(): string {
    return this._props['name'];
  }

  public set name(name: string) {
    this._props['name'] = name;
  }
}

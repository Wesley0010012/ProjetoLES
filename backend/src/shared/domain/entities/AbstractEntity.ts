export type AbstractEntityProps = {
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

export class AbstractEntity<
  Props extends AbstractEntityProps = AbstractEntityProps,
> {
  protected _id?: number;
  protected readonly _props: Props;

  public constructor(props: Props, id?: number) {
    const createdAt = props.createdAt ?? new Date();
    this._props = {
      ...props,
      active: props.active ?? true,
      createdAt: new Date(createdAt.getTime()),
      updatedAt: new Date((props.updatedAt ?? createdAt).getTime()),
    };
    this.id = id;
  }

  public get id(): number {
    return this._id!;
  }

  public set id(id: number | undefined) {
    if (id !== undefined && (!Number.isSafeInteger(id) || id <= 0)) {
      throw new RangeError('entity id must be a positive safe integer');
    }
    this._id = id;
  }

  public get active(): boolean {
    return this._props.active!;
  }

  public set active(active: boolean) {
    this._props.active = active;
  }

  public get createdAt(): Date {
    return this._props.createdAt!;
  }

  public set createdAt(createdAt: Date) {
    this.assertValidDate(createdAt, 'createdAt');
    this._props.createdAt = new Date(createdAt.getTime());
  }

  public get updatedAt(): Date {
    return this._props.updatedAt!;
  }

  public set updatedAt(updatedAt: Date) {
    this.assertValidDate(updatedAt, 'updatedAt');
    this._props.updatedAt = new Date(updatedAt.getTime());
  }

  public touch(): void {
    this._props['updatedAt'] = new Date();
  }

  public deactivate(): void {
    this._props['active'] = false;
    this.touch();
  }

  public isActive(): boolean {
    return this._props['active']!;
  }

  private assertValidDate(value: Date, field: string): void {
    if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
      throw new RangeError(`${field} must be a valid date`);
    }
  }
}

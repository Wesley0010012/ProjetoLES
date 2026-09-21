export type DimensionsProps = {
  height: number;
  width: number;
  weight: number;
  depth: number;
};

export class Dimensions {
  private readonly _height: number;
  private readonly _width: number;
  private readonly _weight: number;
  private readonly _depth: number;

  public constructor(props: DimensionsProps) {
    this._height = props.height;
    this._width = props.width;
    this._weight = props.weight;
    this._depth = props.depth;
  }

  public get height(): number {
    return this._height;
  }

  public get width(): number {
    return this._width;
  }

  public get weight(): number {
    return this._weight;
  }

  public get depth(): number {
    return this._depth;
  }
}

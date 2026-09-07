import { InputDto } from './InputDto';

export abstract class UpdateInput extends InputDto {
  private readonly _id: number;

  public constructor(id: number) {
    super();
    this._id = id;
  }

  public get id(): number {
    return this._id;
  }
}

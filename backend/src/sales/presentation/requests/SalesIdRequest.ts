import { Request } from 'src/shared/presentation/requests/Request';

export class SalesIdRequest extends Request {
  public readonly id: number;

  public constructor(data: unknown) {
    super(data);
    this.id = this.positiveInteger('id');
  }
}

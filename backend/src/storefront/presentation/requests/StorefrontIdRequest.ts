import { Request } from 'src/shared/presentation/requests/Request';

export class StorefrontIdRequest extends Request {
  public readonly id: number;

  public constructor(data: unknown, param = 'id') {
    super(data);
    this.id = this.positiveInteger(param);
  }
}

import { Request } from 'src/shared/presentation/requests/Request';

export class BookIdRequest extends Request {
  public constructor(params: unknown, private readonly idParam = 'id') {
    super(params);
  }

  public get id(): number {
    return this.positiveInteger(this.idParam);
  }
}

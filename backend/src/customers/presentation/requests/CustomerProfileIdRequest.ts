import { Request } from 'src/shared/presentation/requests/Request';

export class CustomerProfileIdRequest extends Request {
  public readonly customerId: number;
  public readonly id?: number;

  public constructor(data: unknown, requiresItemId = false) {
    super(data);
    this.customerId = this.positiveInteger('customerId');
    this.id = requiresItemId ? this.positiveInteger('id') : undefined;
  }
}

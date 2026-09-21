import { Request } from 'src/shared/presentation/requests/Request';
export type UpdateCustomerCreditCardData = {
  description?: string;
  preferred: boolean;
};
export class UpdateCustomerCreditCardRequest extends Request {
  public readonly data: UpdateCustomerCreditCardData;
  public constructor(body: unknown) {
    super(body);
    this.data = {
      description: this.optionalString('description'),
      preferred: this.boolean('preferred'),
    };
  }
}

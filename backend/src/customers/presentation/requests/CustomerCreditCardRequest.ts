import { CreditCardBrand } from 'src/customers/domain/enums/CreditCardBrand';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { Request } from 'src/shared/presentation/requests/Request';

export type CustomerCreditCardData = {
  number: string;
  printedName: string;
  brand: CreditCardBrand;
  securityCode: string;
  preferred: boolean;
  description?: string;
};

export class CustomerCreditCardRequest extends Request {
  public readonly data: CustomerCreditCardData;

  public constructor(body: unknown) {
    super(body);
    const number = this.string('number').replace(/\D/g, '');
    const securityCode = this.string('securityCode').replace(/\D/g, '');
    if (!/^\d{13,19}$/.test(number)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'number' });
    }
    if (!/^\d{3,4}$/.test(securityCode)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: 'securityCode',
      });
    }
    this.data = {
      number,
      printedName: this.string('printedName'),
      brand: this.enumValue('brand', Object.values(CreditCardBrand)),
      securityCode,
      preferred: this.boolean('preferred'),
      description: this.optionalString('description'),
    };
  }
}

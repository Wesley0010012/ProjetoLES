import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { CreditCardValidationResult } from '../gateways/CreditCardValidator';

export class ValidCreditCardRule implements Rule<CreditCardValidationResult> {
  public validate(result: CreditCardValidationResult): Promise<void> {
    if (!result.valid)
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, {
        param: result.invalidField,
      });
    return Promise.resolve();
  }
}

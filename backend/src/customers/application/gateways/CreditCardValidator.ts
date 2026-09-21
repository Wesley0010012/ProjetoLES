import { CreditCardBrand } from 'src/customers/domain/enums/CreditCardBrand';

export type CreditCardValidationInput = {
  number: string;
  printedName: string;
  brand: CreditCardBrand;
  securityCode: string;
};

export type CreditCardValidationResult =
  | {
      valid: true;
      token: string;
      lastFourDigits: string;
    }
  | {
      valid: false;
      invalidField: 'number' | 'printedName' | 'brand' | 'securityCode';
    };

export abstract class CreditCardValidator {
  public abstract validateAndTokenize(
    input: CreditCardValidationInput,
  ): Promise<CreditCardValidationResult>;
}

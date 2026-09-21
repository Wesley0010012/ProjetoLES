import { randomUUID } from 'node:crypto';
import {
  CreditCardValidator,
  CreditCardValidationInput,
  CreditCardValidationResult,
} from 'src/customers/application/gateways/CreditCardValidator';
import { CreditCardBrand } from 'src/customers/domain/enums/CreditCardBrand';

export class MockCreditCardValidator extends CreditCardValidator {
  public validateAndTokenize(
    input: CreditCardValidationInput,
  ): Promise<CreditCardValidationResult> {
    if (!this.isValidNumber(input.number)) {
      return Promise.resolve({ valid: false, invalidField: 'number' });
    }
    if (!this.matchesBrand(input.number, input.brand)) {
      return Promise.resolve({ valid: false, invalidField: 'brand' });
    }
    if (!this.isValidSecurityCode(input.securityCode, input.brand)) {
      return Promise.resolve({ valid: false, invalidField: 'securityCode' });
    }
    if (input.printedName.trim().split(/\s+/).length < 2) {
      return Promise.resolve({ valid: false, invalidField: 'printedName' });
    }

    const behavior =
      input.number === '4000000000000002' ? 'declined' : 'approved';
    return Promise.resolve({
      valid: true,
      token: `mock-card-${behavior}-${randomUUID()}`,
      lastFourDigits: input.number.slice(-4),
    });
  }

  private isValidNumber(number: string): boolean {
    if (!/^\d{13,19}$/.test(number)) {
      return false;
    }
    let sum = 0;
    let doubleDigit = false;
    for (let index = number.length - 1; index >= 0; index -= 1) {
      let digit = Number(number[index]);
      if (doubleDigit) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      doubleDigit = !doubleDigit;
    }
    return sum % 10 === 0;
  }

  private matchesBrand(number: string, brand: CreditCardBrand): boolean {
    const patterns: Record<CreditCardBrand, RegExp> = {
      [CreditCardBrand.VISA]: /^4/,
      [CreditCardBrand.MASTERCARD]: /^(5[1-5]|2[2-7])/,
      [CreditCardBrand.AMERICAN_EXPRESS]: /^3[47]/,
      [CreditCardBrand.ELO]:
        /^(4011|4312|4389|4514|4576|5041|506[67]|509|6277|636[23]|650|6516|6550)/,
    };
    return patterns[brand].test(number);
  }

  private isValidSecurityCode(
    securityCode: string,
    brand: CreditCardBrand,
  ): boolean {
    return brand === CreditCardBrand.AMERICAN_EXPRESS
      ? /^\d{4}$/.test(securityCode)
      : /^\d{3}$/.test(securityCode);
  }
}

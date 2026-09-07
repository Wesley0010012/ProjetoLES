import { Document } from './Document';

export class CPF extends Document {
  protected normalize(number: string): string {
    const cpf = super.normalize(number);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
      throw new TypeError('invalid CPF');
    }

    for (let digit = 9; digit < 11; digit += 1) {
      let sum = 0;
      for (let index = 0; index < digit; index += 1) {
        sum += Number(cpf[index]) * (digit + 1 - index);
      }
      const expected = ((sum * 10) % 11) % 10;
      if (Number(cpf[digit]) !== expected) {
        throw new TypeError('invalid CPF');
      }
    }
    return cpf;
  }
}

// Construtores de massa de dados. Funções puras, sem dependência do Cypress —
// podem ser reutilizadas por qualquer runner (ou testadas isoladamente).

import type { Address, AddressType, Card, Identity, Profile, ProfileOverrides } from './types';

let sequence = 0;

export const PASSWORD = 'Cliente@123';

export function identity(): Identity {
  const digits = String(Date.now() + ++sequence)
    .slice(-9)
    .split('')
    .map(Number);
  for (let size = 9; size < 11; size++) {
    const sum = digits.reduce((total, digit, index) => total + digit * (size + 1 - index), 0);
    const check = (sum * 10) % 11;
    digits.push(check === 10 ? 0 : check);
  }
  return { email: `e2e-${Date.now()}-${sequence}@libra.test`, document: digits.join('') };
}

export function address(type: AddressType | string = 'Delivery', name = 'Entrega E2E'): Address {
  return {
    name,
    residenceType: 'Casa',
    streetType: 'Rua',
    street: 'Rua dos Testes',
    number: '123',
    district: 'Centro',
    zipCode: '01001000',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    type,
  };
}

export function card(overrides: Partial<Card> = {}): Card {
  return {
    number: '4242424242424242',
    printedName: 'Cliente Teste',
    brand: 'VISA',
    securityCode: '123',
    preferred: true,
    ...overrides,
  };
}

export function profile(document: string, overrides: ProfileOverrides = {}): Profile {
  return {
    name: 'Cliente Cypress',
    gender: 'MAN',
    birthDate: '1995-01-01',
    document,
    phoneType: 'MOBILE',
    phoneDdd: '11',
    phoneNumber: '987654321',
    addresses: (['Primary', 'Billing', 'Delivery'] as AddressType[]).map((type) => address(type, `${type} E2E`)),
    cards: [card(), card({ number: '5555555555554444', brand: 'MASTERCARD', preferred: false })],
    ...overrides,
  };
}

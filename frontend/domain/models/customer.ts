export type Customer = {
  id: number;
  code: string;
  name: string;
  gender: string;
  birthDate: string;
  document: string;
  phone: {
    type: string;
    ddd: string;
    number: string;
  };
  email: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CustomerPayload = {
  name: string;
  gender: string;
  birthDate: string;
  document: string;
  phoneType: string;
  phoneDdd: string;
  phoneNumber: string;
  email: string;
  password?: string;
  passwordConfirmation?: string;
};

export type CustomerAddress = {
  id: number;
  name: string;
  residenceType: string;
  streetType: string;
  street: string;
  number: string;
  district: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
  observations?: string;
  billing: boolean;
  delivery: boolean;
};

export type CustomerCard = {
  id: number;
  lastFourDigits: string;
  printedName: string;
  brand: string;
  preferred: boolean;
};

export type CustomerAddressPayload = Omit<CustomerAddress, "id">;

export type CustomerCardPayload = {
  number: string;
  printedName: string;
  brand: string;
  securityCode: string;
  preferred: boolean;
};

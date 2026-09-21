import { ResidenceTypeEnum } from 'src/customers/domain/enums/ResidenceTypeEnum';
import { StreetTypeEnum } from 'src/customers/domain/enums/StreetTypeEnum';
import { CustomerAddressTypeEnum } from 'src/customers/domain/enums/CustomerAddressTypeEnum';
import { Request } from 'src/shared/presentation/requests/Request';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';

export type CustomerAddressData = {
  name: string;
  residenceType: ResidenceTypeEnum;
  streetType: StreetTypeEnum;
  street: string;
  number: string;
  district: string;
  zipCode: string;
  city: string;
  state: string;
  country: string;
  observations?: string;
  type: CustomerAddressTypeEnum;
};

export class CustomerAddressRequest extends Request {
  public readonly data: CustomerAddressData;

  public constructor(body: unknown) {
    super(body);
    const zipCode = this.string('zipCode').replace(/\D/g, '');
    if (!/^\d{8}$/.test(zipCode)) {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'zipCode' });
    }
    this.data = {
      name: this.string('name'),
      residenceType: this.enumValue('residenceType', Object.values(ResidenceTypeEnum)),
      streetType: this.enumValue('streetType', Object.values(StreetTypeEnum)),
      street: this.string('street'),
      number: this.string('number'),
      district: this.string('district'),
      zipCode,
      city: this.string('city'),
      state: this.string('state'),
      country: this.string('country'),
      observations: this.optionalString('observations'),
      type: this.enumValue('type', Object.values(CustomerAddressTypeEnum)),
    };
  }
}

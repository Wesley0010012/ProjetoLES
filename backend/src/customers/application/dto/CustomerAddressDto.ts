import { OutputDto } from 'src/shared/application/dto/output/OutputDto';
import { ResidenceTypeEnum } from '../../domain/enums/ResidenceTypeEnum';
import { StreetTypeEnum } from '../../domain/enums/StreetTypeEnum';
import { CustomerAddressTypeEnum } from '../../domain/enums/CustomerAddressTypeEnum';

export class CustomerAddressDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly residenceType: ResidenceTypeEnum,
    public readonly streetType: StreetTypeEnum,
    public readonly street: string,
    public readonly number: string,
    public readonly district: string,
    public readonly zipCode: string,
    public readonly city: string,
    public readonly state: string,
    public readonly country: string,
    public readonly observations: string | undefined,
    public readonly type: CustomerAddressTypeEnum,
  ) {
    super();
  }
}

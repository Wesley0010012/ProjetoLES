import { OutputDto } from 'src/shared/application/dto/output/OutputDto';
import { GenderEnum } from 'src/shared/domain/enums/GenderEnum';
import { PhoneTypeEnum } from 'src/shared/domain/enums/PhoneTypeEnum';

export class CustomerDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly code: string,
    public readonly name: string,
    public readonly gender: GenderEnum,
    public readonly birthDate: string,
    public readonly document: string,
    public readonly phone: {
      type: PhoneTypeEnum;
      ddd: string;
      number: string;
    },
    public readonly email: string,
    public readonly active: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly userId: number,
  ) {
    super();
  }
}

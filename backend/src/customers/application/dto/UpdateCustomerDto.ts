import { UpdateInput } from 'src/shared/application/dto/input/UpdateInput';
import { GenderEnum } from 'src/shared/domain/enums/GenderEnum';
import { PhoneTypeEnum } from 'src/shared/domain/enums/PhoneTypeEnum';

export class UpdateCustomerDto extends UpdateInput {
  public constructor(
    id: number,
    public readonly name: string,
    public readonly gender: GenderEnum,
    public readonly birthDate: Date,
    public readonly document: string,
    public readonly phoneType: PhoneTypeEnum,
    public readonly phoneDdd: string,
    public readonly phoneNumber: string,
    public readonly email: string,
    public readonly password?: string,
    public readonly passwordConfirmation?: string,
  ) {
    super(id);
  }
}

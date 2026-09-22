import { UpdateCustomerDto } from 'src/customers/application/dto/UpdateCustomerDto';
import { GenderEnum } from 'src/shared/domain/enums/GenderEnum';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { PhoneTypeEnum } from 'src/shared/domain/enums/PhoneTypeEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { CPF } from 'src/shared/domain/vo/documents/CPF';
import { Request } from 'src/shared/presentation/requests/Request';

export class UpdateCustomerRequest extends Request {
  private readonly _dto: UpdateCustomerDto;

  public constructor(id: number, data: unknown) {
    super(data);

    const document = this.string('document').replace(/\D/g, '');
    const ddd = this.string('phoneDdd').replace(/\D/g, '');
    const phoneNumber = this.string('phoneNumber').replace(/\D/g, '');
    const birthDate = new Date(this.string('birthDate'));
    const password = this.optionalString('password');
    const passwordConfirmation = this.optionalString('passwordConfirmation');

    try {
      new CPF(document);
    } catch {
      this.invalid('document');
    }
    if (!/^\d{2}$/.test(ddd)) {
      this.invalid('phoneDdd');
    }
    if (!/^\d{8,11}$/.test(phoneNumber)) {
      this.invalid('phoneNumber');
    }
    if (Number.isNaN(birthDate.getTime())) {
      this.invalid('birthDate');
    }
    if ((password === undefined) !== (passwordConfirmation === undefined)) {
      this.invalid('passwordConfirmation');
    }

    this._dto = new UpdateCustomerDto(
      id,
      this.string('name'),
      this.enumValue('gender', Object.values(GenderEnum)),
      birthDate,
      document,
      this.enumValue('phoneType', Object.values(PhoneTypeEnum)),
      ddd,
      phoneNumber,
      this.email('email'),
      password,
      passwordConfirmation,
    );
  }

  public toDto(): UpdateCustomerDto {
    return this._dto;
  }

  private invalid(param: string): never {
    throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param });
  }
}

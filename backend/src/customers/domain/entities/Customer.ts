import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { GenderEnum } from 'src/shared/domain/enums/GenderEnum';
import { CPF } from 'src/shared/domain/vo/documents/CPF';
import { Phone } from 'src/shared/domain/vo/Phone';
import { User } from 'src/users/domain/entities/User';

export type CustomerProps = AbstractEntityProps & {
  name: string;
  gender: GenderEnum;
  birthDate: Date;
  document: CPF;
  phone: Phone;
  user: User;
};

export class Customer extends AbstractEntity<CustomerProps> {
  public get code(): string {
    return `CLI-${String(this.id).padStart(6, '0')}`;
  }

  public get name(): string {
    return this._props.name;
  }

  public set name(name: string) {
    this._props.name = name;
  }

  public get gender(): GenderEnum {
    return this._props.gender;
  }

  public set gender(gender: GenderEnum) {
    this._props.gender = gender;
  }

  public get birthDate(): Date {
    return this._props.birthDate;
  }

  public set birthDate(birthDate: Date) {
    this._props.birthDate = birthDate;
  }

  public get document(): CPF {
    return this._props.document;
  }

  public set document(document: CPF) {
    this._props.document = document;
  }

  public get phone(): Phone {
    return this._props.phone;
  }

  public set phone(phone: Phone) {
    this._props.phone = phone;
  }

  public get user(): User {
    return this._props.user;
  }
}

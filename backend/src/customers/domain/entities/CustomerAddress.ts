import { ResidenceTypeEnum } from 'src/customers/domain/enums/ResidenceTypeEnum';
import { StreetTypeEnum } from 'src/customers/domain/enums/StreetTypeEnum';
import { CustomerAddressTypeEnum } from 'src/customers/domain/enums/CustomerAddressTypeEnum';
import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { Customer } from './Customer';

export type CustomerAddressProps = AbstractEntityProps & {
  customer: Customer;
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

export class CustomerAddress extends AbstractEntity<CustomerAddressProps> {
  public get customer(): Customer {
    return this._props.customer;
  }
  public get name(): string {
    return this._props.name;
  }
  public set name(value: string) {
    this._props.name = value;
  }
  public get residenceType(): ResidenceTypeEnum {
    return this._props.residenceType;
  }
  public set residenceType(value: ResidenceTypeEnum) {
    this._props.residenceType = value;
  }
  public get streetType(): StreetTypeEnum {
    return this._props.streetType;
  }
  public set streetType(value: StreetTypeEnum) {
    this._props.streetType = value;
  }
  public get street(): string {
    return this._props.street;
  }
  public set street(value: string) {
    this._props.street = value;
  }
  public get number(): string {
    return this._props.number;
  }
  public set number(value: string) {
    this._props.number = value;
  }
  public get district(): string {
    return this._props.district;
  }
  public set district(value: string) {
    this._props.district = value;
  }
  public get zipCode(): string {
    return this._props.zipCode;
  }
  public set zipCode(value: string) {
    this._props.zipCode = value;
  }
  public get city(): string {
    return this._props.city;
  }
  public set city(value: string) {
    this._props.city = value;
  }
  public get state(): string {
    return this._props.state;
  }
  public set state(value: string) {
    this._props.state = value;
  }
  public get country(): string {
    return this._props.country;
  }
  public set country(value: string) {
    this._props.country = value;
  }
  public get observations(): string | undefined {
    return this._props.observations;
  }
  public set observations(value: string | undefined) {
    this._props.observations = value;
  }
  public get type(): CustomerAddressTypeEnum {
    return this._props.type;
  }
  public set type(value: CustomerAddressTypeEnum) {
    this._props.type = value;
  }
}

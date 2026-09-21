import { UserType } from '../../domain/enums/UserType';

export class SignInDto {
  public constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly type: UserType,
  ) {}
}

import { OutputDto } from 'src/shared/application/dto/output/OutputDto';
import { UserType } from '../../domain/enums/UserType';

export class UserDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly type: UserType,
    public readonly active: boolean,
  ) {
    super();
  }
}

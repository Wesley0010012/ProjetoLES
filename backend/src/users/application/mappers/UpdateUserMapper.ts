import { UpdateInputToEntity } from 'src/shared/application/protocols/mappers/UpdateInputToEntity';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { Email } from 'src/shared/domain/vo/Email';
import { UpdateUserDto } from '../../application/dto/UpdateUserDto';
import { User } from '../../domain/entities/User';

export class UpdateUserMapper implements UpdateInputToEntity<
  UpdateUserDto,
  User
> {
  public updateData(input: UpdateUserDto, user: User): Promise<void> {
    try {
      user.email = new Email(input.email);
    } catch {
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'email' });
    }
    return Promise.resolve();
  }
}

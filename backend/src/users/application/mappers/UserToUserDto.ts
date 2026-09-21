import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { UserDto } from '../../application/dto/UserDto';
import { User } from '../../domain/entities/User';

export class UserToUserDto implements EntityToOutputDto<User, UserDto> {
  public toDto(user: User): Promise<UserDto> {
    return Promise.resolve(
      new UserDto(user.id, user.email.address, user.type, user.active),
    );
  }
}

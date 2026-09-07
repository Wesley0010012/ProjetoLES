import { AddInputToEntity } from 'src/shared/application/protocols/mappers/AddInputToEntity';
import { AddUserDto } from '../../application/dto/AddUserDto';
import { User } from '../../domain/entities/User';

export class AddUserDtoToUser implements AddInputToEntity<AddUserDto, User> {
  public toEntity(input: AddUserDto): Promise<User> {
    return Promise.resolve(new User({ email: input.email, type: input.type }));
  }
}

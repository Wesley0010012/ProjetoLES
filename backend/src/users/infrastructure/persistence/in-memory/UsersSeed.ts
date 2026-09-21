import { Email } from 'src/shared/domain/vo/Email';
import { User } from '../../../domain/entities/User';
import { UserType } from '../../../domain/enums/UserType';

// Stable IDs let the front-end mock select a client or an operator.
export function createUsersSeed(): User[] {
  return [
    new User(
      { email: new Email('henry.townshend@libra.com.br'), type: UserType.USER },
      1,
    ),
    new User(
      { email: new Email('operador@libra.com.br'), type: UserType.OPERATOR },
      2,
    ),
    new User(
      { email: new Email('ada.lovelace@libra.com.br'), type: UserType.USER },
      3,
    ),
    new User(
      { email: new Email('alan.turing@libra.com.br'), type: UserType.USER },
      4,
    ),
    new User(
      { email: new Email('grace.hopper@libra.com.br'), type: UserType.USER },
      5,
    ),
    new User(
      {
        email: new Email('margaret.hamilton@libra.com.br'),
        type: UserType.USER,
      },
      6,
    ),
  ];
}

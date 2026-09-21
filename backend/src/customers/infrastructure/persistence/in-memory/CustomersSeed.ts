import { Customer } from '../../../domain/entities/Customer';
import { UsersRepository } from 'src/users/domain/repositories/UsersRepository';
import { GenderEnum } from 'src/shared/domain/enums/GenderEnum';
import { PhoneTypeEnum } from 'src/shared/domain/enums/PhoneTypeEnum';
import { CPF } from 'src/shared/domain/vo/documents/CPF';
import { Phone } from 'src/shared/domain/vo/Phone';

export async function createCustomersSeed(
  users: UsersRepository,
): Promise<Customer[]> {
  const definitions = [
    {
      id: 1,
      userId: 1,
      name: 'Henry Townshend',
      gender: GenderEnum.MAN,
      birthDate: '1990-05-15',
      document: '52998224725',
      ddd: '11',
      phone: '987654321',
      createdAt: '2026-01-12T10:00:00.000Z',
      updatedAt: '2026-08-18T14:00:00.000Z',
    },
    {
      id: 2,
      userId: 3,
      name: 'Ada Lovelace',
      gender: GenderEnum.WOMAN,
      birthDate: '1988-12-10',
      document: '39053344705',
      ddd: '11',
      phone: '976543210',
      createdAt: '2026-02-03T10:00:00.000Z',
      updatedAt: '2026-08-15T14:00:00.000Z',
    },
    {
      id: 3,
      userId: 4,
      name: 'Alan Turing',
      gender: GenderEnum.MAN,
      birthDate: '1985-06-23',
      document: '16899535009',
      ddd: '21',
      phone: '998765432',
      createdAt: '2026-03-08T10:00:00.000Z',
      updatedAt: '2026-08-12T14:00:00.000Z',
    },
    {
      id: 4,
      userId: 5,
      name: 'Grace Hopper',
      gender: GenderEnum.WOMAN,
      birthDate: '1992-12-09',
      document: '11144477735',
      ddd: '31',
      phone: '991234567',
      createdAt: '2026-04-14T10:00:00.000Z',
      updatedAt: '2026-08-10T14:00:00.000Z',
    },
    {
      id: 5,
      userId: 6,
      name: 'Margaret Hamilton',
      gender: GenderEnum.WOMAN,
      birthDate: '1987-08-17',
      document: '12345678909',
      ddd: '41',
      phone: '988776655',
      createdAt: '2026-05-20T10:00:00.000Z',
      updatedAt: '2026-08-08T14:00:00.000Z',
    },
  ];
  return Promise.all(
    definitions.map(async (data) => {
      const user = await users.findById(data.userId);
      if (!user)
        throw new Error(
          `Missing user ${data.userId} for customer seed ${data.id}`,
        );
      return new Customer(
        {
          name: data.name,
          gender: data.gender,
          birthDate: new Date(`${data.birthDate}T00:00:00.000Z`),
          document: new CPF(data.document),
          phone: new Phone(PhoneTypeEnum.MOBILE, data.ddd, data.phone),
          user,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
        },
        data.id,
      );
    }),
  );
}

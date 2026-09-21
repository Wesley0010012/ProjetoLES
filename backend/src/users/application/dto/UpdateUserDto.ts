import { UpdateInput } from 'src/shared/application/dto/input/UpdateInput';

export class UpdateUserDto extends UpdateInput {
  public constructor(
    id: number,
    public readonly email: string,
  ) {
    super(id);
  }
}

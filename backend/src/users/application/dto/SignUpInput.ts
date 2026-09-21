import { AddInput } from 'src/shared/application/dto/input/AddInput';

export class SignUpInput extends AddInput {
  public constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly passwordConfirmation: string,
  ) {
    super();
  }
}

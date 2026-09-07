import { Request } from 'src/shared/presentation/requests/Request';

export class UpdatePasswordRequest extends Request {
  public readonly password: string;
  public readonly passwordConfirmation: string;

  public constructor(data: unknown) {
    super(data);
    this.password = this.string('password');
    this.passwordConfirmation = this.string('passwordConfirmation');
  }
}

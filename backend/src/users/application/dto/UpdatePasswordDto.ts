export class UpdatePasswordDto {
  public constructor(
    public readonly id: number,
    public readonly password: string,
    public readonly passwordConfirmation: string,
  ) {}
}

import { OutputDto } from 'src/shared/application/dto/output/OutputDto';

export class TokenDto extends OutputDto {
  public constructor(
    public readonly token: string,
    public readonly userId: number,
    public readonly expiresAt: Date,
  ) {
    super();
  }
}

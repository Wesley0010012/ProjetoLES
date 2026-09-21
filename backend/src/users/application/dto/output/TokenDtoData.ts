import { OutputDto } from 'src/shared/application/dto/output/OutputDto';

export class TokenDtoData extends OutputDto {
  public constructor(
    public readonly userId: number,
    public readonly expiresAt: Date,
  ) {
    super();
  }
}

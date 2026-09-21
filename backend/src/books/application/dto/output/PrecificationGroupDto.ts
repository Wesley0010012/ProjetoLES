import { OutputDto } from 'src/shared/application/dto/output/OutputDto';

export class PrecificationGroupDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly profitMarginPercentage: number,
  ) {
    super();
  }
}

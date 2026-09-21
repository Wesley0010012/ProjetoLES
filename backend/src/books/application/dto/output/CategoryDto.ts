import { OutputDto } from 'src/shared/application/dto/output/OutputDto';

export class CategoryDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly name: string,
  ) {
    super();
  }
}

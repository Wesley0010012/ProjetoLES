import { OutputDto } from 'src/shared/application/dto/output/OutputDto';

export class EditorDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly name: string,
  ) {
    super();
  }
}

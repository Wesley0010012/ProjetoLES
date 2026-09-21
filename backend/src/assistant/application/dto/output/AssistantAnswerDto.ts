import { OutputDto } from 'src/shared/application/dto/output/OutputDto';

export class AssistantAnswerProductDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly price: number,
    public readonly available: boolean,
  ) {
    super();
  }
}

export class AssistantAnswerDto extends OutputDto {
  public constructor(
    public readonly answer: string,
    public readonly products: AssistantAnswerProductDto[],
    public readonly provider: string,
  ) {
    super();
  }
}

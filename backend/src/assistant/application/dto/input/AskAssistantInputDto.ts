import { InputDto } from 'src/shared/application/dto/input/InputDto';

export class AskAssistantInputDto extends InputDto {
  public constructor(
    public readonly userId: number,
    public readonly question: string,
  ) {
    super();
  }
}

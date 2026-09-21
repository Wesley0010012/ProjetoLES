import { OutputDto } from './OutputDto';

export class CreatedEntityDto extends OutputDto {
  public constructor(public readonly id: number) {
    super();
  }
}

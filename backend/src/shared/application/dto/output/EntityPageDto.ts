import { OutputDto } from './OutputDto';

export class EntityPageDto<EntityDto extends OutputDto> extends OutputDto {
  public constructor(
    public readonly totalEntities: number,
    public readonly entities: EntityDto[],
    public readonly totalPages: number,
  ) {
    super();
  }
}

import { OutputDto } from '../../dto/output/OutputDto';
import { EntityPageDto } from '../../dto/output/EntityPageDto';
import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { EntityPage } from 'src/shared/domain/entities/EntityPage';
import { EntityToOutputDto } from './EntityToOutputDto';

export class EntityPageToEntityPageDto<
  Entity extends AbstractEntity,
  EntityDto extends OutputDto,
> {
  public constructor(
    private readonly _entityToOutputDto: EntityToOutputDto<Entity, EntityDto>,
  ) {}

  public async toDto(
    page: EntityPage<Entity>,
  ): Promise<EntityPageDto<EntityDto>> {
    const entities = await Promise.all(
      page.entities.map((entity) => this._entityToOutputDto.toDto(entity)),
    );

    return new EntityPageDto(page.totalEntities, entities, page.totalPages);
  }
}

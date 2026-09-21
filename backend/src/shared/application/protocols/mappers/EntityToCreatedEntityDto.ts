import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { CreatedEntityDto } from '../../dto/output/CreatedEntityDto';
import { EntityToOutputDto } from './EntityToOutputDto';

export class EntityToCreatedEntityDto<
  Entity extends AbstractEntity,
> implements EntityToOutputDto<Entity, CreatedEntityDto> {
  public async toDto(entity: Entity): Promise<CreatedEntityDto> {
    return new CreatedEntityDto(entity.id);
  }
}

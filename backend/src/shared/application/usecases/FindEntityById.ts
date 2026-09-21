import { FindRequiredEntity } from './FindRequiredEntity';
import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { OutputDto } from '../dto/output/OutputDto';
import { FindByIdRepository } from 'src/shared/domain/repositories/protocols/FindByIdRepository';
import { EntityToOutputDto } from '../protocols/mappers/EntityToOutputDto';

export class FindEntityById<
  Entity extends AbstractEntity,
  Output extends OutputDto,
> {
  public constructor(
    private readonly _repository: FindByIdRepository<Entity>,
    private readonly _entityToOutputDto: EntityToOutputDto<Entity, Output>,
  ) {}

  public async execute(id: number): Promise<Output> {
    const entity = await new FindRequiredEntity(this._repository).execute(id);

    return this._entityToOutputDto.toDto(entity);
  }
}

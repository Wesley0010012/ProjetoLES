import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { OutputDto } from '../dto/output/OutputDto';
import { FindByIdRepository } from 'src/shared/domain/repositories/protocols/FindByIdRepository';
import { EntityToOutputDto } from '../protocols/mappers/EntityToOutputDto';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';

export class FindEntityById<
  Entity extends AbstractEntity,
  Output extends OutputDto,
> {
  private readonly _repository: FindByIdRepository<Entity>;
  private readonly _entityToOutputDto: EntityToOutputDto<Entity, Output>;

  public constructor(
    repository: FindByIdRepository<Entity>,
    entityToOutputDto: EntityToOutputDto<Entity, Output>,
  ) {
    this._repository = repository;
    this._entityToOutputDto = entityToOutputDto;
  }

  public async execute(id: number): Promise<Output> {
    const entity = await this._repository.findById(id);

    if (!entity) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    }

    return await this._entityToOutputDto.toDto(entity);
  }
}

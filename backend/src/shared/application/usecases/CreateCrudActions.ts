import { AbstractEntity } from '../../domain/entities/AbstractEntity';
import { CrudRepository } from '../../domain/repositories/CrudRepository';
import { AddInput } from '../dto/input/AddInput';
import { UpdateInput } from '../dto/input/UpdateInput';
import { OutputDto } from '../dto/output/OutputDto';
import { AddInputToEntity } from '../protocols/mappers/AddInputToEntity';
import { EntityPageToEntityPageDto } from '../protocols/mappers/EntityPageToEntityPageDto';
import { EntityToOutputDto } from '../protocols/mappers/EntityToOutputDto';
import { UpdateInputToEntity } from '../protocols/mappers/UpdateInputToEntity';
import { RulesMap } from '../protocols/rules/RulesMap';
import { AddEntity } from './AddEntity';
import { CrudActions } from './CrudActions';
import { DeleteEntityById } from './DeleteEntityById';
import { FindAll } from './FindAll';
import { FindEntityById } from './FindEntityById';
import { UpdateEntity } from './UpdateEntity';

export function createCrudActions<
  Entity extends AbstractEntity,
  CreateInput extends AddInput,
  UpdateInputDto extends UpdateInput,
  EntityDto extends OutputDto,
>(
  repository: CrudRepository<Entity>,
  mapper: AddInputToEntity<CreateInput, Entity> &
    UpdateInputToEntity<UpdateInputDto, Entity> &
    EntityToOutputDto<Entity, EntityDto>,
  rules: RulesMap<Entity> = new RulesMap<Entity>([]),
): CrudActions<CreateInput, UpdateInputDto, EntityDto> {
  const create = new AddEntity<Entity, CreateInput, EntityDto>(
    mapper,
    rules,
    repository,
    mapper,
  );
  const update = new UpdateEntity<Entity, UpdateInputDto, EntityDto>(
    repository,
    mapper,
    rules,
    repository,
    mapper,
  );
  const deleteEntity = new DeleteEntityById(repository, repository);
  const findById = new FindEntityById<Entity, EntityDto>(repository, mapper);
  const findAll = new FindAll<Entity, EntityDto>(
    repository,
    new EntityPageToEntityPageDto<Entity, EntityDto>(mapper),
  );

  return {
    create: (input) => create.execute(input),
    update: (input) => update.execute(input),
    delete: (id) => deleteEntity.execute(id),
    findById: (id) => findById.execute(id),
    findAll: (search) => findAll.execute(search),
  };
}

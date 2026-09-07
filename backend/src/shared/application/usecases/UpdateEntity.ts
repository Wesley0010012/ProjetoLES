import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { OutputDto } from '../dto/output/OutputDto';
import { RulesMap } from '../protocols/rules/RulesMap';
import { UpdateInputToEntity } from '../protocols/mappers/UpdateInputToEntity';
import { UpdateRepository } from 'src/shared/domain/repositories/protocols/UpdateRepository';
import { EntityToOutputDto } from '../protocols/mappers/EntityToOutputDto';
import { UpdateInput } from '../dto/input/UpdateInput';
import { FindByIdRepository } from 'src/shared/domain/repositories/protocols/FindByIdRepository';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';

export class UpdateEntity<
  Entity extends AbstractEntity,
  Input extends UpdateInput,
  Output extends OutputDto,
> {
  private readonly _findByIdRepository: FindByIdRepository<Entity>;
  private readonly _updateInputToEntity: UpdateInputToEntity<Input, Entity>;
  private readonly _updateRules: RulesMap<Entity>;
  private readonly _updateRepository: UpdateRepository<Entity>;
  private readonly _entityToOutputDto: EntityToOutputDto<Entity, Output>;

  public constructor(
    findByIdRepository: FindByIdRepository<Entity>,
    updateInputToEntity: UpdateInputToEntity<Input, Entity>,
    updateRules: RulesMap<Entity>,
    updateRepository: UpdateRepository<Entity>,
    entityToOutputDto: EntityToOutputDto<Entity, Output>,
  ) {
    this._findByIdRepository = findByIdRepository;
    this._updateInputToEntity = updateInputToEntity;
    this._updateRules = updateRules;
    this._updateRepository = updateRepository;
    this._entityToOutputDto = entityToOutputDto;
  }

  public async execute(input: Input): Promise<Output> {
    const entity = await this._findByIdRepository.findById(input.id);

    if (!entity) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: input.id });
    }

    await this._updateInputToEntity.updateData(input, entity);

    await this._updateRules.validate(entity);

    await this._updateRepository.update(entity);

    return await this._entityToOutputDto.toDto(entity);
  }
}

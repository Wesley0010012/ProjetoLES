import { FindRequiredEntity } from './FindRequiredEntity';
import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { OutputDto } from '../dto/output/OutputDto';
import { RulesMap } from '../protocols/rules/RulesMap';
import { UpdateInputToEntity } from '../protocols/mappers/UpdateInputToEntity';
import { UpdateRepository } from 'src/shared/domain/repositories/protocols/UpdateRepository';
import { EntityToOutputDto } from '../protocols/mappers/EntityToOutputDto';
import { UpdateInput } from '../dto/input/UpdateInput';
import { FindByIdRepository } from 'src/shared/domain/repositories/protocols/FindByIdRepository';

export class UpdateEntity<
  Entity extends AbstractEntity,
  Input extends UpdateInput,
  Output extends OutputDto,
> {
  public constructor(
    private readonly _findByIdRepository: FindByIdRepository<Entity>,
    private readonly _updateInputToEntity: UpdateInputToEntity<Input, Entity>,
    private readonly _updateRules: RulesMap<Entity>,
    private readonly _updateRepository: UpdateRepository<Entity>,
    private readonly _entityToOutputDto: EntityToOutputDto<Entity, Output>,
  ) {}

  public async execute(input: Input): Promise<Output> {
    const entity = await new FindRequiredEntity(
      this._findByIdRepository,
    ).execute(input.id);

    await this._updateInputToEntity.updateData(input, entity);

    await this._updateRules.validate(entity);

    await this._updateRepository.update(entity);

    return this._entityToOutputDto.toDto(entity);
  }
}

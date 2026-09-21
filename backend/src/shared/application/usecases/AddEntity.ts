import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { AddInput } from '../dto/input/AddInput';
import { OutputDto } from '../dto/output/OutputDto';
import { RulesMap } from '../protocols/rules/RulesMap';
import { AddInputToEntity } from '../protocols/mappers/AddInputToEntity';
import { AddRepository } from 'src/shared/domain/repositories/protocols/AddRepository';
import { EntityToOutputDto } from '../protocols/mappers/EntityToOutputDto';

export class AddEntity<
  Entity extends AbstractEntity,
  Input extends AddInput,
  Output extends OutputDto,
> {
  public constructor(
    private readonly _addInputToEntity: AddInputToEntity<Input, Entity>,
    private readonly _rulesMap: RulesMap<Entity>,
    private readonly _addRepository: AddRepository<Entity>,
    private readonly _entityToOutputDto: EntityToOutputDto<Entity, Output>,
  ) {}

  public async execute(input: Input): Promise<Output> {
    const entity = await this.executeEntity(input);
    return this._entityToOutputDto.toDto(entity);
  }

  public async executeEntity(input: Input): Promise<Entity> {
    const entity = await this._addInputToEntity.toEntity(input);
    await this._rulesMap.validate(entity);
    await this._addRepository.add(entity);
    return entity;
  }
}

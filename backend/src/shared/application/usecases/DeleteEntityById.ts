import { FindRequiredEntity } from './FindRequiredEntity';
import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { FindByIdRepository } from 'src/shared/domain/repositories/protocols/FindByIdRepository';
import { UpdateRepository } from 'src/shared/domain/repositories/protocols/UpdateRepository';

export class DeleteEntityById<Entity extends AbstractEntity> {
  public constructor(
    private readonly _findByIdRepository: FindByIdRepository<Entity>,
    private readonly _updateRepository: UpdateRepository<Entity>,
  ) {}

  public async execute(id: number): Promise<void> {
    const entity = await new FindRequiredEntity(
      this._findByIdRepository,
    ).execute(id);

    entity.deactivate();

    await this._updateRepository.update(entity);
  }
}

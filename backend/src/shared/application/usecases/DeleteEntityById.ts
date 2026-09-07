import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { FindByIdRepository } from 'src/shared/domain/repositories/protocols/FindByIdRepository';
import { UpdateRepository } from 'src/shared/domain/repositories/protocols/UpdateRepository';

export class DeleteEntityById<Entity extends AbstractEntity> {
  private readonly _findByIdRepository: FindByIdRepository<Entity>;
  private readonly _updateRepository: UpdateRepository<Entity>;

  public constructor(
    findByIdRepository: FindByIdRepository<Entity>,
    updateRepository: UpdateRepository<Entity>,
  ) {
    this._findByIdRepository = findByIdRepository;
    this._updateRepository = updateRepository;
  }

  public async execute(id: number): Promise<void> {
    const entity = await this._findByIdRepository.findById(id);

    if (!entity) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id });
    }

    entity.deactivate();

    await this._updateRepository.update(entity);
  }
}

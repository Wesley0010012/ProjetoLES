import { AbstractEntity } from './AbstractEntity';

export class EntityPage<Entity extends AbstractEntity> {
  public constructor(
    public readonly totalEntities: number,
    public readonly entities: Entity[],
    public readonly totalPages: number,
  ) {
    if (!Number.isSafeInteger(totalEntities) || totalEntities < 0) {
      throw new RangeError('totalEntities must be a non-negative integer');
    }
    if (!Number.isSafeInteger(totalPages) || totalPages < 0) {
      throw new RangeError('totalPages must be a non-negative integer');
    }
    if (entities.length > totalEntities) {
      throw new RangeError('page cannot contain more entities than the total');
    }
  }
}

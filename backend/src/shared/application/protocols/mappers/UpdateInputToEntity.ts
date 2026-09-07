import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { UpdateInput } from '../../dto/input/UpdateInput';

export interface UpdateInputToEntity<
  Input extends UpdateInput,
  Entity extends AbstractEntity,
> {
  updateData(input: Input, entity: Entity): Promise<void>;
}

import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { AddInput } from '../../dto/input/AddInput';

export interface AddInputToEntity<
  Input extends AddInput,
  Output extends AbstractEntity,
> {
  toEntity(input: Input): Promise<Output>;
}

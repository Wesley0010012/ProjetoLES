import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { OutputDto } from '../../dto/output/OutputDto';

export interface EntityToOutputDto<
  Input extends AbstractEntity,
  Output extends OutputDto,
> {
  toDto(input: Input): Promise<Output>;
}

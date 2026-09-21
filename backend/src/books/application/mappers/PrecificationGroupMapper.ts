import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { PrecificationGroup } from '../../domain/entities/PrecificationGroup';
import { PrecificationGroupDto } from '../dto/output/PrecificationGroupDto';

export class PrecificationGroupMapper implements EntityToOutputDto<
  PrecificationGroup,
  PrecificationGroupDto
> {
  public toDto(
    precificationGroup: PrecificationGroup,
  ): Promise<PrecificationGroupDto> {
    return Promise.resolve(
      new PrecificationGroupDto(
        precificationGroup.id,
        precificationGroup.name,
        precificationGroup.profitMarginPercentage,
      ),
    );
  }
}

import { OutputDto } from '../dto/output/OutputDto';
import { EntityPageDto } from '../dto/output/EntityPageDto';
import { EntityPageToEntityPageDto } from '../protocols/mappers/EntityPageToEntityPageDto';
import { AbstractEntity } from 'src/shared/domain/entities/AbstractEntity';
import { FindAllRepository } from 'src/shared/domain/repositories/protocols/FindAllRepository';
import { Search } from 'src/shared/domain/repositories/Search';

export class FindAll<
  Entity extends AbstractEntity,
  EntityDto extends OutputDto,
> {
  public constructor(
    private readonly _repository: FindAllRepository<Entity>,
    private readonly _pageMapper: EntityPageToEntityPageDto<Entity, EntityDto>,
  ) {}

  public async execute(
    search: Search,
  ): Promise<EntityPageDto<EntityDto> | EntityDto[]> {
    const page = await this._repository.findAll(search);
    const pageDto = await this._pageMapper.toDto(page);

    if (!search.isPaginated()) {
      return pageDto.entities;
    }

    return pageDto;
  }
}

import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { Category } from '../../domain/entities/Category';
import { CategoryDto } from '../dto/output/CategoryDto';

export class CategoryMapper implements EntityToOutputDto<
  Category,
  CategoryDto
> {
  public toDto(category: Category): Promise<CategoryDto> {
    return Promise.resolve(new CategoryDto(category.id, category.name));
  }
}

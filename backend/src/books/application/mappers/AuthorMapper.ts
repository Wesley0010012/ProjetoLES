import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { Author } from '../../domain/entities/Author';
import { AuthorDto } from '../dto/output/AuthorDto';

export class AuthorMapper implements EntityToOutputDto<Author, AuthorDto> {
  public toDto(author: Author): Promise<AuthorDto> {
    return Promise.resolve(new AuthorDto(author.id, author.name));
  }
}

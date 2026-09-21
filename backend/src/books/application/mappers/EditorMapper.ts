import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { Editor } from '../../domain/entities/Editor';
import { EditorDto } from '../dto/output/EditorDto';

export class EditorMapper implements EntityToOutputDto<Editor, EditorDto> {
  public toDto(editor: Editor): Promise<EditorDto> {
    return Promise.resolve(new EditorDto(editor.id, editor.name));
  }
}

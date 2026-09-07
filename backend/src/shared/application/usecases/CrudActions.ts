import { AddInput } from '../dto/input/AddInput';
import { UpdateInput } from '../dto/input/UpdateInput';
import { EntityPageDto } from '../dto/output/EntityPageDto';
import { OutputDto } from '../dto/output/OutputDto';
import { Search } from '../../domain/repositories/Search';

export interface CrudActions<
  CreateInput extends AddInput,
  UpdateInputDto extends UpdateInput,
  Output extends OutputDto,
> {
  create(input: CreateInput): Promise<Output>;
  update(input: UpdateInputDto): Promise<Output>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<Output>;
  findAll(search: Search): Promise<EntityPageDto<Output> | Output[]>;
}

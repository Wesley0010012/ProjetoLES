import { AbstractEntity } from '../entities/AbstractEntity';
import { AddRepository } from './protocols/AddRepository';
import { FindByIdRepository } from './protocols/FindByIdRepository';
import { FindAllRepository } from './protocols/FindAllRepository';
import { UpdateRepository } from './protocols/UpdateRepository';

export interface CrudRepository<Entity extends AbstractEntity>
  extends
    FindByIdRepository<Entity>,
    FindAllRepository<Entity>,
    UpdateRepository<Entity>,
    AddRepository<Entity> {}

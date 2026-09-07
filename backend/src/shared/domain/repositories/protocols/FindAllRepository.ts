import { AbstractEntity } from '../../entities/AbstractEntity';
import { EntityPage } from '../../entities/EntityPage';
import { Search } from '../Search';

export interface FindAllRepository<Entity extends AbstractEntity> {
  findAll(search: Search): Promise<EntityPage<Entity>>;
}

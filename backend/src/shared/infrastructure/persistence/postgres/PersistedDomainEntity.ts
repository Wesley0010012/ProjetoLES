import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Registro físico para os agregados do domínio.
 *
 * O domínio não recebe decorators do ORM: cada registro preserva o tipo, o id
 * de negócio e o estado serializado da entidade. Isso mantém as entidades e
 * casos de uso independentes de TypeORM.
 */
@Entity({ name: 'domain_entities' })
@Index(['kind', 'domainId'], { unique: true })
export class PersistedDomainEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 96 })
  kind!: string;

  @Column({ name: 'domain_id', type: 'integer' })
  domainId!: number;

  @Column({ type: 'jsonb' })
  payload!: unknown;
}

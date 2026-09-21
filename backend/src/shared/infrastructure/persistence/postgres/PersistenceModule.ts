import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DomainEntityCodec } from './DomainEntityCodec';
import { PersistedDomainEntity } from './PersistedDomainEntity';

@Module({
  imports: [TypeOrmModule.forFeature([PersistedDomainEntity])],
  providers: [DomainEntityCodec],
  exports: [TypeOrmModule, DomainEntityCodec],
})
export class PersistenceModule {}

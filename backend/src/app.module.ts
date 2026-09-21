import { BooksModule } from './books/books.module';
import { StockModule } from './stock/stock.module';
import { SalesModule } from './sales/sales.module';
import { StorefrontModule } from './storefront/storefront.module';
import { AssistantModule } from './assistant/assistant.module';
import { CustomersModule } from './customers/customers.module';
import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersistedDomainEntity } from './shared/infrastructure/persistence/postgres/PersistedDomainEntity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      host: process.env.DATABASE_URL
        ? undefined
        : (process.env.DB_HOST ?? process.env.POSTGRES_HOST ?? 'localhost'),
      port: process.env.DATABASE_URL
        ? undefined
        : Number(process.env.DB_PORT ?? process.env.POSTGRES_PORT ?? 5432),
      username: process.env.DATABASE_URL
        ? undefined
        : (process.env.DB_USER ?? process.env.POSTGRES_USER ?? 'libra'),
      password: process.env.DATABASE_URL
        ? undefined
        : (process.env.DB_PASSWORD ?? process.env.POSTGRES_PASSWORD ?? 'libra'),
      database: process.env.DATABASE_URL
        ? undefined
        : (process.env.DB_NAME ?? process.env.POSTGRES_DB ?? 'libra'),
      entities: [PersistedDomainEntity],
      synchronize:
        process.env.DB_SYNCHRONIZE === 'true' ||
        (process.env.NODE_ENV !== 'production' &&
          process.env.DB_SYNCHRONIZE !== 'false'),
      logging: true
    }),
    SharedModule,
    UsersModule,
    CustomersModule,
    StockModule,
    SalesModule,
    StorefrontModule,
    AssistantModule,
    BooksModule,
  ],
})
export class AppModule {}

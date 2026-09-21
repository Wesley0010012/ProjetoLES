import { Module } from '@nestjs/common';
import { ReenterStock } from 'src/stock/application/usecases/ReenterStock';
import { InMemoryBookSalePriceRepository } from 'src/stock/infrastructure/persistence/in-memory/InMemoryBookSalePriceRepository';
import { InMemoryStockBalanceRepository } from 'src/stock/infrastructure/persistence/in-memory/InMemoryStockBalanceRepository';
import { InMemoryStockEntryRepository } from 'src/stock/infrastructure/persistence/in-memory/InMemoryStockEntryRepository';
import { InMemoryStockMovementRepository } from 'src/stock/infrastructure/persistence/in-memory/InMemoryStockMovementRepository';
import { InMemorySupplierRepository } from 'src/stock/infrastructure/persistence/in-memory/InMemorySupplierRepository';

@Module({
  providers: [
    InMemorySupplierRepository,
    InMemoryStockEntryRepository,
    InMemoryStockBalanceRepository,
    InMemoryBookSalePriceRepository,
    InMemoryStockMovementRepository,
    {
      provide: ReenterStock,
      inject: [InMemoryStockBalanceRepository, InMemoryStockMovementRepository],
      useFactory: (
        balances: InMemoryStockBalanceRepository,
        movements: InMemoryStockMovementRepository,
      ) => new ReenterStock(balances, movements),
    },
  ],
  exports: [
    ReenterStock,
    InMemoryStockBalanceRepository,
    InMemoryBookSalePriceRepository,
    InMemoryStockMovementRepository,
  ],
})
export class StockModule {}

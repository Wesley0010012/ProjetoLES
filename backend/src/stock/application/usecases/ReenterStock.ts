import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { NotFound } from 'src/shared/domain/errors/NotFound';
import { StockMovement } from 'src/stock/domain/entities/StockMovement';
import { StockMovementType } from 'src/stock/domain/enums/StockMovementType';
import { StockBalanceRepository } from 'src/stock/domain/repositories/StockBalanceRepository';
import { StockMovementRepository } from 'src/stock/domain/repositories/StockMovementRepository';
import { StockQuantityInput } from '../dto/StockQuantityInput';

export class ReenterStock {
  public constructor(
    private readonly _balances: StockBalanceRepository,
    private readonly _movements: StockMovementRepository,
  ) {}

  public async execute(input: StockQuantityInput): Promise<void> {
    const balance = await this._balances.findByBookId(input.bookId);

    if (!balance) {
      throw new NotFound(MessageKeyEnum.ENTITY_NOT_FOUND, { id: input.bookId });
    }

    balance.add(input.quantity);
    await this._balances.update(balance);
    await this._movements.add(
      new StockMovement({
        book: balance.book,
        type: StockMovementType.REENTRY,
        quantity: input.quantity,
        occurredAt: input.occurredAt,
      }),
    );
  }
}

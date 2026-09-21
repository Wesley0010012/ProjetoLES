export class StockQuantityInput {
  public constructor(
    public readonly bookId: number,
    public readonly quantity: number,
    public readonly occurredAt: Date,
  ) {}
}

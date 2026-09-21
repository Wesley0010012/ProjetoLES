export class StockEntryInput {
  public constructor(
    public readonly bookId: number,
    public readonly quantity: number,
    public readonly unitCost: number,
    public readonly supplierId: number,
    public readonly entryDate: Date,
  ) {}
}

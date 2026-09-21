export class StockItemDto {
  public constructor(
    public readonly bookId: number,
    public readonly code: string,
    public readonly title: string,
    public readonly availableQuantity: number,
    public readonly blockedQuantity: number,
    public readonly costBasis: number,
    public readonly salePrice: number,
    public readonly profitMarginPercentage: number,
  ) {}
}

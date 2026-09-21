import { OutputDto } from 'src/shared/application/dto/output/OutputDto';

export type ShoppingCartItemDto = {
  bookId: number;
  code: string;
  title: string;
  authors: string[];
  quantity: number;
  unitPrice: number;
  total: number;
};

export class ShoppingCartDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly items: ShoppingCartItemDto[],
    public readonly subtotal: number,
    public readonly estimatedFreight: number,
    public readonly expiresAt: Date | undefined,
  ) {
    super();
  }
}

import { OutputDto } from 'src/shared/application/dto/output/OutputDto';
import { CreditCardBrand } from '../../domain/enums/CreditCardBrand';

export class CustomerCreditCardDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly lastFourDigits: string,
    public readonly printedName: string,
    public readonly brand: CreditCardBrand,
    public readonly preferred: boolean,
    public readonly description: string | undefined,
  ) {
    super();
  }
}

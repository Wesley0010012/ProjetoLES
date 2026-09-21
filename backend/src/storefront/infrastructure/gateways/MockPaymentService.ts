import { PaymentAllocation } from '../../application/protocols/PaymentService';
import { PaymentService } from '../../application/protocols/PaymentService';

export class MockPaymentService implements PaymentService {
  public async authorize(allocations: PaymentAllocation[]): Promise<boolean> {
    return (
      allocations.length > 0 &&
      allocations.every(
        ({ card, amount }) =>
          amount > 0 && !card.gatewayToken.includes('declined'),
      )
    );
  }
}

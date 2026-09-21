import { CustomerCreditCard } from 'src/customers/domain/entities/CustomerCreditCard';

export type PaymentAllocation = {
  card: CustomerCreditCard;
  amount: number;
};

export interface PaymentService {
  authorize(allocations: PaymentAllocation[]): Promise<boolean>;
}

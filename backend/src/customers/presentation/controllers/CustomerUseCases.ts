import { EntityPageDto } from 'src/shared/application/dto/output/EntityPageDto';
import { CustomerSearch } from 'src/customers/application/CustomerSearch';
import { CustomerDto } from 'src/customers/application/dto/CustomerDto';
import { UpdateCustomerDto } from 'src/customers/application/dto/UpdateCustomerDto';

export const CUSTOMER_USE_CASES = 'CUSTOMER_USE_CASES';

export type CustomerUseCases = {
  update(input: UpdateCustomerDto): Promise<CustomerDto>;
  delete(id: number): Promise<void>;
  findById(id: number): Promise<CustomerDto>;
  findAll(
    search: CustomerSearch,
  ): Promise<EntityPageDto<CustomerDto> | CustomerDto[]>;
};

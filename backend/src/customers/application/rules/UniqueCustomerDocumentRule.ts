import { Rule } from 'src/shared/application/protocols/rules/Rule';
import { BadRequest } from 'src/shared/domain/errors/BadRequest';
import { MessageKeyEnum } from 'src/shared/domain/enums/MessageKeyEnum';
import { CustomerRepository } from '../../domain/repositories/CustomerRepository';
import { Customer } from '../../domain/entities/Customer';
type CustomerDocumentData = { document: string; id?: number } | Customer;

export class UniqueCustomerDocumentRule implements Rule<CustomerDocumentData> {
  public constructor(private readonly repository: CustomerRepository) {}
  public async validate(data: CustomerDocumentData): Promise<void> {
    const document =
      data instanceof Customer ? data.document.number : data.document;
    const id = data instanceof Customer ? data.id : data.id;
    if (await this.repository.existsByDocument(document, id))
      throw new BadRequest(MessageKeyEnum.INVALID_PARAM, { param: 'document' });
  }
}

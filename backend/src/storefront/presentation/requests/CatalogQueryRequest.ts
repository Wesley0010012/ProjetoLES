import { Request } from 'src/shared/presentation/requests/Request';

export class CatalogQueryRequest extends Request {
  public readonly query?: string;
  public readonly category?: string;
  public readonly context: string;

  public constructor(data: unknown) {
    super(data);
    this.query = this.optionalString('query');
    this.category = this.optionalString('category');
    this.context = this.optionalString('context') ?? 'HOME';
  }
}

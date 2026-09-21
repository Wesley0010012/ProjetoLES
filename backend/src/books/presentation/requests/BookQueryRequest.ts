import { Request } from 'src/shared/presentation/requests/Request';

export class BookQueryRequest extends Request {
  public constructor(query: unknown) {
    super(query);
  }

  public get query(): string | undefined {
    return this.optionalString('query');
  }

  public get category(): string | undefined {
    return this.optionalString('category');
  }

  public get context(): string {
    return this.optionalString('context') ?? 'HOME';
  }
}

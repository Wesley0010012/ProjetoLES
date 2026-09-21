import { CategoryDto } from '../../application/dto/output/CategoryDto';
import { ProductBookDto } from '../../application/dto/output/ProductBookDto';

export const BOOK_USE_CASES = 'BOOK_USE_CASES';

export type BookUseCases = {
  list(query?: string, category?: string): Promise<ProductBookDto[]>;
  findById(id: number): Promise<ProductBookDto | null>;
  categories(): Promise<CategoryDto[]>;
};

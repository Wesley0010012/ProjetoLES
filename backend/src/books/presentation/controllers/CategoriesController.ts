import { Controller, Get, Inject } from '@nestjs/common';
import { BOOK_USE_CASES } from './BookUseCases';
import type { BookUseCases } from './BookUseCases';

@Controller('categories')
export class CategoriesController {
  public constructor(
    @Inject(BOOK_USE_CASES) private readonly _books: BookUseCases,
  ) {}

  @Get()
  public categories() {
    return this._books.categories();
  }
}

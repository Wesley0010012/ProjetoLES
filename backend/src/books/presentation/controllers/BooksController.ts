import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { BookQueryRequest } from '../requests/BookQueryRequest';
import { BookIdRequest } from '../requests/BookIdRequest';
import { BOOK_USE_CASES } from './BookUseCases';
import type { BookUseCases } from './BookUseCases';

@Controller('books')
export class BooksController {
  public constructor(
    @Inject(BOOK_USE_CASES) private readonly _books: BookUseCases,
  ) {}

  @Get()
  public books(@Query() query: unknown) {
    const request = new BookQueryRequest(query);
    return this._books.list(request.query, request.category);
  }

  @Get(':id')
  public book(@Param() params: unknown) {
    return this._books.findById(new BookIdRequest(params).id);
  }
}

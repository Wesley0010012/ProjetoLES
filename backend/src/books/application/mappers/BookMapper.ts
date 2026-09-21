import { EntityToOutputDto } from 'src/shared/application/protocols/mappers/EntityToOutputDto';
import { StockBalanceRepository } from 'src/stock/domain/repositories/StockBalanceRepository';
import { Book } from '../../domain/entities/Book';
import { ProductBookDto } from '../dto/output/ProductBookDto';
import { AuthorMapper } from './AuthorMapper';
import { CategoryMapper } from './CategoryMapper';
import { EditorMapper } from './EditorMapper';
import { PrecificationGroupMapper } from './PrecificationGroupMapper';

export class BookMapper implements EntityToOutputDto<Book, ProductBookDto> {
  public constructor(
    private readonly _balances: StockBalanceRepository,
    private readonly _authors: AuthorMapper = new AuthorMapper(),
    private readonly _categories: CategoryMapper = new CategoryMapper(),
    private readonly _editors: EditorMapper = new EditorMapper(),
    private readonly _precificationGroups: PrecificationGroupMapper = new PrecificationGroupMapper(),
  ) {}

  public async toDto(book: Book): Promise<ProductBookDto> {
    const balance = await this._balances.findByBookId(book.id);
    const availableQuantity = balance?.availableQuantity ?? 0;

    const [authors, categories, editors, precificationGroup] =
      await Promise.all([
        Promise.all(book.authors.map((author) => this._authors.toDto(author))),
        Promise.all(
          book.categories.map((category) => this._categories.toDto(category)),
        ),
        Promise.all(book.editors.map((editor) => this._editors.toDto(editor))),
        this._precificationGroups.toDto(book.precificationGroup),
      ]);

    return new ProductBookDto(
      book.id,
      book.coverImage,
      book.barcode,
      precificationGroup,
      book.code,
      book.title,
      authors,
      categories,
      editors,
      book.year,
      book.edition,
      book.isbn,
      book.synopsis,
      book.numberOfPages,
      {
        height: book.dimensions.height,
        width: book.dimensions.width,
        weight: book.dimensions.weight,
        depth: book.dimensions.depth,
      },
      book.defaultPrice,
      availableQuantity,
      availableQuantity > 0,
    );
  }
}

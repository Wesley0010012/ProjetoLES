import {
  AbstractEntity,
  AbstractEntityProps,
} from 'src/shared/domain/entities/AbstractEntity';
import { Dimensions } from '../vo/Dimensions';
import { Author } from './Author';
import { Category } from './Category';
import { Editor } from './Editor';
import { PrecificationGroup } from './PrecificationGroup';

export type BookProps = AbstractEntityProps & {
  coverImage?: string;
  code: string;
  authors: Author[];
  categories: Category[];
  year: number;
  title: string;
  editors: Editor[];
  edition: string;
  isbn: string;
  numberOfPages: number;
  synopsis: string;
  dimensions: Dimensions;
  precificationGroup: PrecificationGroup;
  barcode: string;
  defaultPrice: number;
};

export class Book extends AbstractEntity<BookProps> {
  public get coverImage(): string {
    return this._props.coverImage ?? '/images/books/placeholder.svg';
  }

  public get code(): string {
    return this._props['code'];
  }

  public set code(code: string) {
    this._props['code'] = code;
  }

  public get authors(): Author[] {
    return [...this._props['authors']];
  }

  public set authors(authors: Author[]) {
    this._props['authors'] = [...authors];
  }

  public get categories(): Category[] {
    return [...this._props['categories']];
  }

  public set categories(categories: Category[]) {
    this._props['categories'] = [...categories];
  }

  public get year(): number {
    return this._props['year'];
  }

  public set year(year: number) {
    this._props['year'] = year;
  }

  public get title(): string {
    return this._props['title'];
  }

  public set title(title: string) {
    this._props['title'] = title;
  }

  public get editors(): Editor[] {
    return [...this._props['editors']];
  }

  public set editors(editors: Editor[]) {
    this._props['editors'] = [...editors];
  }

  public get edition(): string {
    return this._props['edition'];
  }

  public set edition(edition: string) {
    this._props['edition'] = edition;
  }

  public get isbn(): string {
    return this._props['isbn'];
  }

  public set isbn(isbn: string) {
    this._props['isbn'] = isbn;
  }

  public get numberOfPages(): number {
    return this._props['numberOfPages'];
  }

  public set numberOfPages(numberOfPages: number) {
    this._props['numberOfPages'] = numberOfPages;
  }

  public get synopsis(): string {
    return this._props['synopsis'];
  }

  public set synopsis(synopsis: string) {
    this._props['synopsis'] = synopsis;
  }

  public get dimensions(): Dimensions {
    return this._props['dimensions'];
  }

  public set dimensions(dimensions: Dimensions) {
    this._props['dimensions'] = dimensions;
  }

  public get precificationGroup(): PrecificationGroup {
    return this._props['precificationGroup'];
  }

  public set precificationGroup(precificationGroup: PrecificationGroup) {
    this._props['precificationGroup'] = precificationGroup;
  }

  public get defaultPrice(): number {
    return this._props['defaultPrice'];
  }

  public set defaultPrice(defaultPrice: number) {
    this._props['defaultPrice'] = defaultPrice;
  }

  public get barcode(): string {
    return this._props['barcode'];
  }

  public set barcode(barcode: string) {
    this._props['barcode'] = barcode;
  }
}

import { OutputDto } from 'src/shared/application/dto/output/OutputDto';
import { AuthorDto } from './AuthorDto';
import { CategoryDto } from './CategoryDto';
import { EditorDto } from './EditorDto';
import { PrecificationGroupDto } from './PrecificationGroupDto';

export type ProductBookDimensionsDto = {
  height: number;
  width: number;
  weight: number;
  depth: number;
};

export class ProductBookDto extends OutputDto {
  public constructor(
    public readonly id: number,
    public readonly coverImage: string,
    public readonly barcode: string,
    public readonly precificationGroup: PrecificationGroupDto,
    public readonly code: string,
    public readonly title: string,
    public readonly authors: AuthorDto[],
    public readonly categories: CategoryDto[],
    public readonly editors: EditorDto[],
    public readonly year: number,
    public readonly edition: string,
    public readonly isbn: string,
    public readonly synopsis: string,
    public readonly numberOfPages: number,
    public readonly dimensions: ProductBookDimensionsDto,
    public readonly price: number,
    public readonly availableQuantity: number,
    public readonly available: boolean,
  ) {
    super();
  }
}

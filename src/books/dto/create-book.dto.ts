// ==================== src/books/dto/create-book.dto.ts ====================
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsString()
  @IsNotEmpty()
  isbn: string;

  @IsInt()
  @Min(1000)
  published_year: number;

  @IsInt()
  @Min(0)
  available_copies: number;
}
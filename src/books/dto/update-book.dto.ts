// ==================== src/books/dto/update-book.dto.ts ====================
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateBookDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  author?: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsInt()
  @Min(1000)
  @IsOptional()
  published_year?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  available_copies?: number;
}
// ==================== src/borrowings/dto/create-borrowing.dto.ts ====================
import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateBorrowingDto {
  @IsInt()
  book_id: number;

  @IsString()
  @IsNotEmpty()
  borrower_name: string;

  @IsDateString()
  borrow_date: string;

  @IsDateString()
  return_date: string;
}

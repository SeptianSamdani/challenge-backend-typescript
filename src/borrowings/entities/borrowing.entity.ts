// ==================== src/borrowings/entities/borrowing.entity.ts ====================
export class Borrowing {
  id: number;
  book_id: number;
  borrower_name: string;
  borrow_date: string;
  return_date: string | null;
  returned: boolean;
  created_at: Date;
}
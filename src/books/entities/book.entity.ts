// ==================== src/books/entities/book.entity.ts ====================
export class Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  published_year: number;
  available_copies: number;
  created_at: Date;
  updated_at: Date;
}
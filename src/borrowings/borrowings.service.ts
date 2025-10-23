// ==================== src/borrowings/borrowings.service.ts ====================
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBorrowingDto } from './dto/create-borrowing.dto';
import { Borrowing } from './entities/borrowing.entity';

@Injectable()
export class BorrowingsService {
  constructor(private databaseService: DatabaseService) {}

  async create(createBorrowingDto: CreateBorrowingDto): Promise<Borrowing> {
    const { book_id, borrower_name, borrow_date, return_date } =
      createBorrowingDto;

    // Check if book exists and has available copies
    const book = await this.databaseService.get<any>(
      'SELECT * FROM books WHERE id = ?',
      [book_id],
    );

    if (!book) {
      throw new NotFoundException(`Book with ID ${book_id} not found`);
    }

    if (book.available_copies <= 0) {
      throw new BadRequestException('No available copies for this book');
    }

    // Create borrowing
    const result = await this.databaseService.run(
      `INSERT INTO borrowings (book_id, borrower_name, borrow_date, return_date) 
       VALUES (?, ?, ?, ?)`,
      [book_id, borrower_name, borrow_date, return_date],
    );

    // Decrease available copies
    await this.databaseService.run(
      'UPDATE books SET available_copies = available_copies - 1 WHERE id = ?',
      [book_id],
    );

    return this.findOne(result.lastID);
  }

  async findAll(): Promise<Borrowing[]> {
    return this.databaseService.query<Borrowing>(
      'SELECT * FROM borrowings ORDER BY created_at DESC',
    );
  }

  async findOne(id: number): Promise<Borrowing> {
    const borrowing = await this.databaseService.get<Borrowing>(
      'SELECT * FROM borrowings WHERE id = ?',
      [id],
    );

    if (!borrowing) {
      throw new NotFoundException(`Borrowing with ID ${id} not found`);
    }

    return borrowing;
  }

  async returnBook(id: number): Promise<Borrowing> {
    const borrowing = await this.findOne(id);

    if (borrowing.returned) {
      throw new BadRequestException('Book already returned');
    }

    // Update borrowing as returned
    await this.databaseService.run(
      'UPDATE borrowings SET returned = 1 WHERE id = ?',
      [id],
    );

    // Increase available copies
    await this.databaseService.run(
      'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?',
      [borrowing.book_id],
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const borrowing = await this.findOne(id);

    // If not returned, increase available copies
    if (!borrowing.returned) {
      await this.databaseService.run(
        'UPDATE books SET available_copies = available_copies + 1 WHERE id = ?',
        [borrowing.book_id],
      );
    }

    await this.databaseService.run('DELETE FROM borrowings WHERE id = ?', [
      id,
    ]);
  }
}
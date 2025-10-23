// ==================== src/books/books.service.ts ====================
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Book } from './entities/book.entity';

@Injectable()
export class BooksService {
  constructor(private databaseService: DatabaseService) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const { title, author, isbn, published_year, available_copies } =
      createBookDto;

    // Check if ISBN already exists
    const existingBook = await this.databaseService.get(
      'SELECT * FROM books WHERE isbn = ?',
      [isbn],
    );

    if (existingBook) {
      throw new ConflictException('Book with this ISBN already exists');
    }

    const result = await this.databaseService.run(
      `INSERT INTO books (title, author, isbn, published_year, available_copies) 
       VALUES (?, ?, ?, ?, ?)`,
      [title, author, isbn, published_year, available_copies],
    );

    return this.findOne(result.lastID);
  }

  async findAll(): Promise<Book[]> {
    return this.databaseService.query<Book>('SELECT * FROM books');
  }

  async findOne(id: number): Promise<Book> {
    const book = await this.databaseService.get<Book>(
      'SELECT * FROM books WHERE id = ?',
      [id],
    );

    if (!book) {
      throw new NotFoundException(`Book with ID ${id} not found`);
    }

    return book;
  }

  async update(id: number, updateBookDto: UpdateBookDto): Promise<Book> {
    await this.findOne(id); // Check if book exists

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updateBookDto).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    });

    if (fields.length === 0) {
      return this.findOne(id);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await this.databaseService.run(
      `UPDATE books SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // Check if book exists

    await this.databaseService.run('DELETE FROM books WHERE id = ?', [id]);
  }
}
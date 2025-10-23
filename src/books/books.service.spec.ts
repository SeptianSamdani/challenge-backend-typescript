import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../database/database.service';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

describe('BooksService', () => {
  let service: BooksService;
  let databaseService: DatabaseService;

  const mockDatabaseService = {
    query: jest.fn(),
    get: jest.fn(),
    run: jest.fn(),
  };

  const mockBook = {
    id: 1,
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    published_year: 2008,
    available_copies: 5,
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    databaseService = module.get<DatabaseService>(DatabaseService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createBookDto: CreateBookDto = {
      title: 'Clean Code',
      author: 'Robert C. Martin',
      isbn: '9780132350884',
      published_year: 2008,
      available_copies: 5,
    };

    it('should create a book successfully', async () => {
      mockDatabaseService.get.mockResolvedValue(null);
      mockDatabaseService.run.mockResolvedValue({ lastID: 1 });
      mockDatabaseService.get.mockResolvedValueOnce(null).mockResolvedValueOnce(mockBook);

      const result = await service.create(createBookDto);

      expect(result).toEqual(mockBook);
      expect(databaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO books'),
        expect.arrayContaining([
          createBookDto.title,
          createBookDto.author,
          createBookDto.isbn,
          createBookDto.published_year,
          createBookDto.available_copies,
        ]),
      );
    });

    it('should throw ConflictException if ISBN already exists', async () => {
      mockDatabaseService.get.mockResolvedValue(mockBook);

      await expect(service.create(createBookDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of books', async () => {
      const mockBooks = [mockBook];
      mockDatabaseService.query.mockResolvedValue(mockBooks);

      const result = await service.findAll();

      expect(result).toEqual(mockBooks);
      expect(databaseService.query).toHaveBeenCalledWith('SELECT * FROM books');
    });

    it('should return empty array if no books', async () => {
      mockDatabaseService.query.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a book by id', async () => {
      mockDatabaseService.get.mockResolvedValue(mockBook);

      const result = await service.findOne(1);

      expect(result).toEqual(mockBook);
      expect(databaseService.get).toHaveBeenCalledWith(
        'SELECT * FROM books WHERE id = ?',
        [1],
      );
    });

    it('should throw NotFoundException if book not found', async () => {
      mockDatabaseService.get.mockResolvedValue(undefined);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateBookDto: UpdateBookDto = {
      title: 'Clean Code - Updated',
      available_copies: 10,
    };

    it('should update a book successfully', async () => {
      const updatedBook = { ...mockBook, ...updateBookDto };
      mockDatabaseService.get
        .mockResolvedValueOnce(mockBook) // findOne check
        .mockResolvedValueOnce(updatedBook); // final result
      mockDatabaseService.run.mockResolvedValue({});

      const result = await service.update(1, updateBookDto);

      expect(result).toEqual(updatedBook);
      expect(databaseService.run).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE books SET'),
        expect.any(Array),
      );
    });

    it('should throw NotFoundException if book not found', async () => {
      mockDatabaseService.get.mockResolvedValue(undefined);

      await expect(service.update(999, updateBookDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return book unchanged if no fields to update', async () => {
      mockDatabaseService.get.mockResolvedValue(mockBook);

      const result = await service.update(1, {});

      expect(result).toEqual(mockBook);
      expect(databaseService.run).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should delete a book successfully', async () => {
      mockDatabaseService.get.mockResolvedValue(mockBook);
      mockDatabaseService.run.mockResolvedValue({});

      await service.remove(1);

      expect(databaseService.run).toHaveBeenCalledWith(
        'DELETE FROM books WHERE id = ?',
        [1],
      );
    });

    it('should throw NotFoundException if book not found', async () => {
      mockDatabaseService.get.mockResolvedValue(undefined);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
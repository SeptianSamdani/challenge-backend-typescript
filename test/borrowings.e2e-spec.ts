import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Borrowings (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let bookId: number;
  let borrowingId: number;

  const testUser = {
    username: 'borrowtest_' + Date.now(),
    password: 'password123',
  };

  const testBook = {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    isbn: 'ISBN' + Date.now(),
    publishedYear: 1999,
    availableCopies: 3,
  };

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Register and login
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    authToken = loginResponse.body.access_token;

    // Create a book for borrowing
    const bookResponse = await request(app.getHttpServer())
      .post('/books')
      .set('Authorization', `Bearer ${authToken}`)
      .send(testBook);

    bookId = bookResponse.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/borrowings (POST)', () => {
    it('should create a new borrowing', () => {
      return request(app.getHttpServer())
        .post('/borrowings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: bookId,
          borrowerName: 'John Doe',
          borrowDate: '2025-01-15',
          returnDate: '2025-01-29',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('book_id', bookId);
          expect(res.body).toHaveProperty('borrower_name', 'John Doe');
          expect(res.body).toHaveProperty('returned', 0);
          borrowingId = res.body.id;
        });
    });

    it('should decrease available copies after borrowing', async () => {
      const bookResponse = await request(app.getHttpServer())
        .get(`/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(bookResponse.body.available_copies).toBe(
        testBook.availableCopies - 1,
      );
    });

    it('should fail when book does not exist', () => {
      return request(app.getHttpServer())
        .post('/borrowings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: 99999,
          borrowerName: 'Jane Doe',
          borrowDate: '2025-01-15',
          returnDate: '2025-01-29',
        })
        .expect(404);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/borrowings')
        .send({
          bookId: bookId,
          borrowerName: 'Test User',
          borrowDate: '2025-01-15',
          returnDate: '2025-01-29',
        })
        .expect(401);
    });
  });

  describe('/borrowings (GET)', () => {
    it('should get all borrowings', () => {
      return request(app.getHttpServer())
        .get('/borrowings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/borrowings/:id (GET)', () => {
    it('should get a borrowing by id', () => {
      return request(app.getHttpServer())
        .get(`/borrowings/${borrowingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', borrowingId);
          expect(res.body).toHaveProperty('book_id', bookId);
        });
    });

    it('should return 404 for non-existent borrowing', () => {
      return request(app.getHttpServer())
        .get('/borrowings/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/borrowings/:id/return (PUT)', () => {
    it('should return a borrowed book', () => {
      return request(app.getHttpServer())
        .put(`/borrowings/${borrowingId}/return`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('returned', 1);
        });
    });

    it('should increase available copies after return', async () => {
      const bookResponse = await request(app.getHttpServer())
        .get(`/books/${bookId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(bookResponse.body.available_copies).toBe(testBook.availableCopies);
    });

    it('should fail when trying to return already returned book', () => {
      return request(app.getHttpServer())
        .put(`/borrowings/${borrowingId}/return`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });
  });

  describe('/borrowings/:id (DELETE)', () => {
    it('should delete a borrowing', () => {
      return request(app.getHttpServer())
        .delete(`/borrowings/${borrowingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return 404 when deleting non-existent borrowing', () => {
      return request(app.getHttpServer())
        .delete(`/borrowings/${borrowingId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('No Available Copies Scenario', () => {
    let fullBookId: number;

    beforeAll(async () => {
      // Create a book with 0 available copies
      const bookResponse = await request(app.getHttpServer())
        .post('/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Limited Book',
          author: 'Test Author',
          isbn: 'LIMITED' + Date.now(),
          publishedYear: 2020,
          availableCopies: 0,
        });

      fullBookId = bookResponse.body.id;
    });

    it('should fail to borrow when no copies available', () => {
      return request(app.getHttpServer())
        .post('/borrowings')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          bookId: fullBookId,
          borrowerName: 'Test User',
          borrowDate: '2025-01-15',
          returnDate: '2025-01-29',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('No available copies');
        });
    });
  });
});
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('Books (e2e)', () => {
  let app: INestApplication<App>;
  let authToken: string;
  let createdBookId: number;

  const testUser = {
    username: 'booktest_' + Date.now(),
    password: 'password123',
  };

  const testBook = {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: 'ISBN' + Date.now(),
    publishedYear: 2008,
    availableCopies: 5,
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

    // Register and login to get token
    await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUser);

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/books (POST)', () => {
    it('should create a new book', () => {
      return request(app.getHttpServer())
        .post('/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testBook)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('title', testBook.title);
          expect(res.body).toHaveProperty('author', testBook.author);
          expect(res.body).toHaveProperty('isbn', testBook.isbn);
          createdBookId = res.body.id;
        });
    });

    it('should fail with duplicate ISBN', () => {
      return request(app.getHttpServer())
        .post('/books')
        .set('Authorization', `Bearer ${authToken}`)
        .send(testBook)
        .expect(409);
    });

    it('should fail without authentication', () => {
      return request(app.getHttpServer())
        .post('/books')
        .send({
          title: 'Test Book',
          author: 'Test Author',
          isbn: 'TEST123',
          publishedYear: 2020,
          availableCopies: 1,
        })
        .expect(401);
    });
  });

  describe('/books (GET)', () => {
    it('should get all books', () => {
      return request(app.getHttpServer())
        .get('/books')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          expect(res.body.length).toBeGreaterThan(0);
        });
    });
  });

  describe('/books/:id (GET)', () => {
    it('should get a book by id', () => {
      return request(app.getHttpServer())
        .get(`/books/${createdBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('id', createdBookId);
          expect(res.body).toHaveProperty('title', testBook.title);
        });
    });

    it('should return 404 for non-existent book', () => {
      return request(app.getHttpServer())
        .get('/books/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('/books/:id (PUT)', () => {
    it('should update a book', () => {
      return request(app.getHttpServer())
        .put(`/books/${createdBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Clean Code - Updated',
          availableCopies: 3,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('title', 'Clean Code - Updated');
          expect(res.body).toHaveProperty('available_copies', 3);
        });
    });
  });

  describe('/books/:id (DELETE)', () => {
    it('should delete a book', () => {
      return request(app.getHttpServer())
        .delete(`/books/${createdBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
        });
    });

    it('should return 404 when deleting non-existent book', () => {
      return request(app.getHttpServer())
        .delete(`/books/${createdBookId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });
});
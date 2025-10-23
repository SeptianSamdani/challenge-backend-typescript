import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ValidationPipe } from '@nestjs/common';

describe('Authentication (e2e)', () => {
  let app: INestApplication<App>;
  const testUser = {
    username: 'testuser_' + Date.now(),
    password: 'password123',
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
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('username', testUser.username);
          expect(res.body).toHaveProperty('message');
          expect(res.body).not.toHaveProperty('password');
        });
    });

    it('should fail with duplicate username', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Username already exists');
        });
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'newuser',
          password: '123',
        })
        .expect(400);
    });

    it('should fail with missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          username: 'onlyusername',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login successfully and return JWT token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('access_token');
          expect(typeof res.body.access_token).toBe('string');
          expect(res.body.access_token.length).toBeGreaterThan(0);
          
          // Verify JWT structure (header.payload.signature)
          const tokenParts = res.body.access_token.split('.');
          expect(tokenParts).toHaveLength(3);
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
          password: 'wrongpassword',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should fail with non-existent user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: 'nonexistentuser',
          password: 'password123',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('should fail with missing fields', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          username: testUser.username,
        })
        .expect(400);
    });
  });

  describe('Protected Routes - JWT Token Validation', () => {
    let validToken: string;

    beforeAll(async () => {
      // Get a valid token
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser);
      
      validToken = response.body.access_token;
    });

    it('should access protected route with valid token', () => {
      return request(app.getHttpServer())
        .get('/books')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });

    it('should fail to access protected route without token', () => {
      return request(app.getHttpServer())
        .get('/books')
        .expect(401);
    });

    it('should fail to access protected route with invalid token', () => {
      return request(app.getHttpServer())
        .get('/books')
        .set('Authorization', 'Bearer invalid_token_here')
        .expect(401);
    });

    it('should fail to access protected route with malformed token', () => {
      return request(app.getHttpServer())
        .get('/books')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
    });

    it('should access multiple protected endpoints with same token', async () => {
      await request(app.getHttpServer())
        .get('/books')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get('/borrowings')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });
  });

  describe('JWT Token Content', () => {
    it('should contain correct payload data', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(testUser);

      const token = response.body.access_token;
      
      // Decode JWT payload (middle part)
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1], 'base64').toString(),
      );

      expect(payload).toHaveProperty('username', testUser.username);
      expect(payload).toHaveProperty('sub'); // user id
      expect(payload).toHaveProperty('iat'); // issued at
      expect(payload).toHaveProperty('exp'); // expiration
    });
  });
});
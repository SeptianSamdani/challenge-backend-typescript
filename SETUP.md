# Setup Guide - Library Management API

## 📋 Prerequisites

Pastikan Anda sudah menginstall:
- Node.js >= 20.0.0
- npm >= 10.0.0

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment (Optional)

Copy `.env.example` ke `.env` jika ingin customize:

```bash
cp .env.example .env
```

Default settings sudah cukup untuk development.

### 3. Run Application

```bash
# Development mode with auto-reload
npm run start:dev
```

Server akan berjalan di `http://localhost:3000`

Database SQLite akan otomatis dibuat di file `database.sqlite` saat pertama kali run.

### 4. Test API

#### Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "password123"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "password": "password123"
  }'
```

Response akan berisi `access_token` yang digunakan untuk endpoint lainnya.

#### Create Book (Protected)
```bash
curl -X POST http://localhost:3000/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "title": "Clean Code",
    "author": "Robert C. Martin",
    "isbn": "9780132350884",
    "publishedYear": 2008,
    "availableCopies": 5
  }'
```

## 🧪 Running Tests

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📁 Project Structure Overview

```
src/
├── auth/                     # Authentication Module
│   ├── dto/                  # Data Transfer Objects
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
│   ├── guards/               # Route Guards
│   │   └── jwt-auth.guard.ts
│   ├── strategies/           # Passport Strategies
│   │   └── jwt.strategy.ts
│   ├── auth.controller.ts    # Auth endpoints
│   ├── auth.service.ts       # Auth business logic
│   └── auth.module.ts        # Module definition
│
├── books/                    # Books Module
│   ├── dto/
│   │   ├── create-book.dto.ts
│   │   └── update-book.dto.ts
│   ├── entities/
│   │   └── book.entity.ts
│   ├── books.controller.ts
│   ├── books.service.ts
│   └── books.module.ts
│
├── borrowings/               # Borrowings Module
│   ├── dto/
│   │   └── create-borrowing.dto.ts
│   ├── entities/
│   │   └── borrowing.entity.ts
│   ├── borrowings.controller.ts
│   ├── borrowings.service.ts
│   └── borrowings.module.ts
│
├── database/                 # Database Module
│   ├── database.service.ts   # SQLite wrapper
│   └── database.module.ts
│
├── app.module.ts             # Root module
└── main.ts                   # Application entry point

test/
├── auth.e2e-spec.ts          # Auth E2E tests
├── books.e2e-spec.ts         # Books E2E tests
├── borrowings.e2e-spec.ts    # Borrowings E2E tests
└── jest-e2e.json             # E2E test config
```

## 🏗️ Architecture Explanation

### Layered Architecture Pattern

```
┌─────────────────────────────────────────┐
│         Controller Layer                │
│  (HTTP Request/Response Handling)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│          Service Layer                  │
│     (Business Logic & Validation)       │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│       Database Service Layer            │
│      (Data Access & Persistence)        │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│           SQLite Database               │
└─────────────────────────────────────────┘
```

### Why This Pattern?

1. **Clear Separation of Concerns**
   - Controller: Hanya menangani HTTP request/response
   - Service: Business logic terpisah dari HTTP layer
   - Database: Data access logic terisolasi

2. **Easy Testing**
   - Setiap layer dapat di-test secara independen
   - Mock dependencies dengan mudah
   - Unit test dan E2E test jelas scope-nya

3. **Maintainability**
   - Mudah mencari bug karena tanggung jawab jelas
   - Perubahan di satu layer tidak affect layer lain
   - Code organization yang konsisten

4. **Scalability**
   - Mudah menambah module baru
   - Dapat migrate ke database lain tanpa ubah business logic
   - Dapat menambah middleware/interceptor dengan mudah

5. **NestJS Best Practice**
   - Pattern yang direkomendasikan oleh framework
   - Mudah dipahami developer yang sudah familiar dengan NestJS
   - Sesuai dengan dependency injection pattern

## 🔐 Security Features

1. **Password Hashing**: Menggunakan bcrypt dengan salt rounds 10
2. **JWT Authentication**: Token-based auth dengan expiration
3. **Protected Routes**: Semua endpoint (kecuali auth) dilindungi JWT Guard
4. **Input Validation**: Menggunakan class-validator untuk validasi DTO
5. **SQL Injection Prevention**: Parameterized queries

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Books Table
```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE NOT NULL,
  published_year INTEGER,
  available_copies INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
```

### Borrowings Table
```sql
CREATE TABLE borrowings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  borrower_name TEXT NOT NULL,
  borrow_date DATE NOT NULL,
  return_date DATE,
  returned BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id)
)
```

## 🔄 Business Logic Flow

### Borrow a Book
1. User authenticated via JWT
2. Check if book exists
3. Check if book has available copies
4. Create borrowing record
5. Decrease available_copies by 1
6. Return borrowing details

### Return a Book
1. User authenticated via JWT
2. Check if borrowing exists
3. Check if book not already returned
4. Mark borrowing as returned
5. Increase available_copies by 1
6. Return updated borrowing

### Delete Borrowing
1. User authenticated via JWT
2. Check if borrowing exists
3. If not returned, increase available_copies
4. Delete borrowing record

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Issues
```bash
# Delete database and restart
rm database.sqlite
npm run start:dev
```

### Module Not Found
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

Jika ingin contribute:
1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 Notes

- JWT secret harus diganti di production
- Database SQLite cocok untuk development, consider PostgreSQL/MySQL untuk production
- Rate limiting belum diimplementasi, tambahkan jika needed
- Logging dapat ditambahkan menggunakan Winston atau Pino
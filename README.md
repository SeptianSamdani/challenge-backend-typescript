# Library Management System API

Simple REST API untuk sistem manajemen perpustakaan menggunakan NestJS TypeScript.

## 📚 Studi Kasus

Sistem perpustakaan sederhana yang mengelola:
- **Books**: Koleksi buku perpustakaan
- **Borrowings**: Riwayat peminjaman buku oleh user

## 🏗️ Architecture Pattern

Project ini menggunakan **Layered Architecture Pattern** dengan struktur:

```
Controller Layer → Service Layer → Repository Layer → Database
```

### Alasan Menggunakan Pattern Ini:

1. **Separation of Concerns**: Setiap layer memiliki tanggung jawab yang jelas
   - Controller: Menangani HTTP request/response
   - Service: Business logic
   - Repository: Data access layer

2. **Maintainability**: Mudah untuk maintenance dan debugging karena kode terorganisir dengan baik

3. **Testability**: Setiap layer dapat ditest secara independent dengan mudah

4. **Scalability**: Mudah untuk menambah fitur baru tanpa mengubah struktur yang sudah ada

5. **Best Practice NestJS**: Pattern ini adalah best practice yang direkomendasikan oleh NestJS dan mudah dipahami oleh developer lain

## 🚀 Features

- ✅ CRUD Books (Create, Read, Update, Delete)
- ✅ CRUD Borrowings (Create, Read, Update, Delete)
- ✅ JWT Authentication
- ✅ SQLite Database
- ✅ E2E Testing untuk JWT Authentication
- ✅ Input Validation
- ✅ Error Handling

## 📋 Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0

## 🛠️ Installation

```bash
npm install
```

## 🗄️ Database Setup

Database SQLite akan otomatis dibuat saat aplikasi pertama kali dijalankan di file `database.sqlite`

## ▶️ Running the App

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

App akan berjalan di `http://localhost:3000`

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john",
  "password": "password123"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "john",
  "password": "password123"
}

Response:
{
  "access_token": "eyJhbGc..."
}
```

### Books (Protected)

#### Get All Books
```http
GET /books
Authorization: Bearer {token}
```

#### Get Book by ID
```http
GET /books/:id
Authorization: Bearer {token}
```

#### Create Book
```http
POST /books
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "isbn": "9780132350884",
  "published_year": 2008,
  "available_copies": 5
}
```

#### Update Book
```http
PUT /books/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Clean Code - Updated",
  "available_copies": 3
}
```

#### Delete Book
```http
DELETE /books/:id
Authorization: Bearer {token}
```

### Borrowings (Protected)

#### Get All Borrowings
```http
GET /borrowings
Authorization: Bearer {token}
```

#### Get Borrowing by ID
```http
GET /borrowings/:id
Authorization: Bearer {token}
```

#### Create Borrowing (Borrow Book)
```http
POST /borrowings
Authorization: Bearer {token}
Content-Type: application/json

{
  "book_id": 1,
  "borrower_name": "John Doe",
  "borrow_date": "2025-01-15",
  "return_date": "2025-01-29"
}
```

#### Return Book
```http
PUT /borrowings/:id/return
Authorization: Bearer {token}
```

#### Delete Borrowing
```http
DELETE /borrowings/:id
Authorization: Bearer {token}
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── dto/
│   ├── guards/
│   └── strategies/
├── books/                # Books module
│   ├── books.controller.ts
│   ├── books.service.ts
│   ├── books.module.ts
│   ├── entities/
│   └── dto/
├── borrowings/           # Borrowings module
│   ├── borrowings.controller.ts
│   ├── borrowings.service.ts
│   ├── borrowings.module.ts
│   ├── entities/
│   └── dto/
├── database/             # Database module
│   ├── database.module.ts
│   └── database.service.ts
├── app.module.ts
└── main.ts
```

## 🔒 Security

- Password di-hash menggunakan bcrypt
- JWT token untuk autentikasi
- Protected routes menggunakan JWT Guard

## 📦 Dependencies

- `@nestjs/common` - Core NestJS
- `@nestjs/jwt` - JWT authentication
- `@nestjs/passport` - Passport integration
- `sqlite3` - SQLite database
- `bcrypt` - Password hashing
- `class-validator` - DTO validation
- `class-transformer` - Object transformation

## 👨‍💻 Development Notes

- Database menggunakan SQLite untuk kemudahan development
- Semua endpoints (kecuali auth) memerlukan JWT token
- Borrowing otomatis mengurangi availableCopies dari book
- Return book otomatis menambah kembali availableCopies

## 📝 License

MIT
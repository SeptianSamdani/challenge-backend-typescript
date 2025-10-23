# Complete File Structure

## 📂 Files to Create/Update

### Root Directory
```
library-management-api/
├── .env.example                    # ✅ Created
├── .gitignore                      # ✅ Updated
├── .prettierrc                     # ✅ Already exists
├── README.md                       # ✅ Created (Main documentation)
├── SETUP.md                        # ✅ Created (Setup guide)
├── FILE_STRUCTURE.md              # ✅ This file
├── api-requests.http              # ✅ Created (HTTP requests)
├── eslint.config.mjs              # ✅ Already exists
├── nest-cli.json                  # ✅ Already exists
├── package.json                   # ✅ Updated (with new dependencies)
├── tsconfig.json                  # ✅ Already exists
└── tsconfig.build.json            # ✅ Already exists
```

### Source Code (src/)
```
src/
├── auth/
│   ├── dto/
│   │   ├── login.dto.ts           # ✅ Create
│   │   └── register.dto.ts        # ✅ Create
│   ├── guards/
│   │   └── jwt-auth.guard.ts      # ✅ Create
│   ├── strategies/
│   │   └── jwt.strategy.ts        # ✅ Create
│   ├── auth.controller.ts         # ✅ Create
│   ├── auth.service.ts            # ✅ Create
│   └── auth.module.ts             # ✅ Create
│
├── books/
│   ├── dto/
│   │   ├── create-book.dto.ts     # ✅ Create
│   │   └── update-book.dto.ts     # ✅ Create
│   ├── entities/
│   │   └── book.entity.ts         # ✅ Create
│   ├── books.controller.ts        # ✅ Create
│   ├── books.service.ts           # ✅ Create
│   ├── books.service.spec.ts      # ✅ Create (Unit test)
│   └── books.module.ts            # ✅ Create
│
├── borrowings/
│   ├── dto/
│   │   └── create-borrowing.dto.ts # ✅ Create
│   ├── entities/
│   │   └── borrowing.entity.ts    # ✅ Create
│   ├── borrowings.controller.ts   # ✅ Create
│   ├── borrowings.service.ts      # ✅ Create
│   └── borrowings.module.ts       # ✅ Create
│
├── database/
│   ├── database.service.ts        # ✅ Create
│   └── database.module.ts         # ✅ Create
│
├── app.controller.ts              # ❌ Delete (not used)
├── app.controller.spec.ts         # ❌ Delete (not used)
├── app.service.ts                 # ❌ Delete (not used)
├── app.module.ts                  # ✅ Update
└── main.ts                        # ✅ Update
```

### Tests (test/)
```
test/
├── auth.e2e-spec.ts               # ✅ Create
├── books.e2e-spec.ts              # ✅ Create
├── borrowings.e2e-spec.ts         # ✅ Create
├── app.e2e-spec.ts                # ❌ Delete (not used)
└── jest-e2e.json                  # ✅ Already exists
```

## 🚀 Installation Steps

### 1. Update package.json
Replace your `package.json` with the updated version that includes:
- @nestjs/jwt
- @nestjs/passport
- bcrypt
- class-validator
- class-transformer
- passport
- passport-jwt
- sqlite3

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Directory Structure
```bash
# Create directories
mkdir -p src/auth/dto src/auth/guards src/auth/strategies
mkdir -p src/books/dto src/books/entities
mkdir -p src/borrowings/dto src/borrowings/entities
mkdir -p src/database
```

### 4. Copy All Source Files
Copy all files from the artifacts provided:

**Authentication Module:**
- `src/auth/dto/login.dto.ts`
- `src/auth/dto/register.dto.ts`
- `src/auth/guards/jwt-auth.guard.ts`
- `src/auth/strategies/jwt.strategy.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/auth.module.ts`

**Books Module:**
- `src/books/dto/create-book.dto.ts`
- `src/books/dto/update-book.dto.ts`
- `src/books/entities/book.entity.ts`
- `src/books/books.controller.ts`
- `src/books/books.service.ts`
- `src/books/books.service.spec.ts`
- `src/books/books.module.ts`

**Borrowings Module:**
- `src/borrowings/dto/create-borrowing.dto.ts`
- `src/borrowings/entities/borrowing.entity.ts`
- `src/borrowings/borrowings.controller.ts`
- `src/borrowings/borrowings.service.ts`
- `src/borrowings/borrowings.module.ts`

**Database Module:**
- `src/database/database.service.ts`
- `src/database/database.module.ts`

**Root Files:**
- `src/app.module.ts` (update)
- `src/main.ts` (update)

### 5. Copy Test Files
- `test/auth.e2e-spec.ts`
- `test/books.e2e-spec.ts`
- `test/borrowings.e2e-spec.ts`

### 6. Delete Unused Files
```bash
rm src/app.controller.ts
rm src/app.controller.spec.ts
rm src/app.service.ts
rm test/app.e2e-spec.ts
```

### 7. Update Configuration Files
- `.gitignore` - Add database files
- `.env.example` - Create environment template

### 8. Run Application
```bash
npm run start:dev
```

### 9. Run Tests
```bash
# E2E Tests
npm run test:e2e

# Unit Tests
npm run test

# Coverage
npm run test:cov
```

## ✅ Verification Checklist

- [ ] All dependencies installed
- [ ] All source files created
- [ ] Database initializes on first run
- [ ] Can register user
- [ ] Can login and receive JWT token
- [ ] Can access protected routes with token
- [ ] Can create, read, update, delete books
- [ ] Can create, read, update, delete borrowings
- [ ] Available copies decrease on borrow
- [ ] Available copies increase on return
- [ ] All E2E tests pass
- [ ] Unit tests pass

## 📝 Quick Test Commands

```bash
# Test registration
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"password123"}'

# Test protected endpoint (replace TOKEN)
curl http://localhost:3000/books \
  -H "Authorization: Bearer TOKEN"
```

## 🎯 Key Features Implemented

✅ **2 CRUD Operations dengan Relasi**
- Books (independent)
- Borrowings (dependent on Books via book_id)

✅ **SQL Database**
- SQLite dengan schema yang proper
- Foreign key constraints
- Automatic timestamps

✅ **JWT Authentication**
- Password hashing dengan bcrypt
- Token generation & validation
- Protected routes dengan Guards

✅ **E2E Testing untuk JWT**
- Registration tests
- Login tests
- Token validation tests
- Protected route access tests

✅ **Layered Architecture Pattern**
- Clear separation: Controller → Service → Database
- Easy to test and maintain
- Scalable structure

## 📚 Documentation Files

- `README.md` - Main documentation with API endpoints
- `SETUP.md` - Detailed setup guide and architecture explanation
- `FILE_STRUCTURE.md` - This file, complete file list
- `api-requests.http` - Ready-to-use HTTP requests for testing

## 🎓 Pattern Explanation

Pattern yang digunakan: **Layered Architecture**

Dijelaskan lengkap di `README.md` dan `SETUP.md` termasuk:
- Diagram arsitektur
- Alasan pemilihan pattern
- Keuntungan dan use cases
- Best practices
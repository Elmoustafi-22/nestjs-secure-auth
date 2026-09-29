# Secure Auth API

<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="90" alt="Nest Logo" />
</p>

<p align="center">
  A production-ready, security-first Authentication & Authorization backend service built with <strong>NestJS 11</strong>, <strong>Drizzle ORM</strong>, <strong>PostgreSQL</strong>, <strong>Argon2</strong>, and <strong>Dual-Token JWT</strong> architecture.
</p>

---

## 🔒 Security Highlights

- **Argon2 Hashing**: Uses modern, memory-hard Argon2id algorithm for password hashing, mitigating GPU cracking and rainbow table attacks.
- **Dual-Token JWT Strategy**:
  - **Access Token**: Short-lived (15 minutes by default) Bearer token for authenticating protected routes.
  - **Refresh Token**: Long-lived (7 days by default) token for obtaining fresh token pairs without re-authenticating.
- **Hashed Refresh Tokens in Database**: Refresh tokens are never stored in plaintext in the database. Instead, they are hashed with Argon2 before persistence, preventing session hijacking even in the event of a database compromise.
- **Secure Revocation & Logout**: Logging out immediately invalidates the stored refresh token hash in PostgreSQL.
- **Data Sanitization (`SafeUser`)**: Password hashes, refresh token hashes, and password reset tokens are strictly stripped out of API responses before reaching the client.
- **Global Validation Pipeline**: Strict input validation using `class-validator` and `class-transformer` with `whitelist: true` and `forbidNonWhitelisted: true`.
- **CORS & Cookie Parser**: Configured with explicit frontend origin filtering and HTTP cookie parsing capabilities.

---

## 🛠️ Tech Stack

| Technology | Purpose |
| :--- | :--- |
| **[NestJS 11](https://nestjs.com/)** | Progressive Node.js framework with modular architecture |
| **[TypeScript 5](https://www.typescriptlang.org/)** | Type safety and enhanced developer experience |
| **[Drizzle ORM](https://orm.drizzle.team/)** | High-performance, lightweight TypeScript ORM |
| **[PostgreSQL / Neon](https://neon.tech/)** | Relational database (compatible with serverless / standard Postgres) |
| **[Argon2](https://github.com/ranisalt/node-argon2)** | Industry-standard cryptographic password and token hashing |
| **[@nestjs/jwt](https://github.com/nestjs/jwt)** | JSON Web Token issuance, verification, and rotation |
| **[class-validator](https://github.com/typestack/class-validator)** | Declarative request payload validation |
| **[Resend](https://resend.com/)** | Transactional email provider for password resets |

---

## 📁 Project Architecture

```
nest-auth/
├── drizzle/                     # Drizzle SQL migration files
├── src/
│   ├── auth/                    # Authentication feature module
│   │   ├── dto/                 # Request validation DTOs (Register, Login, Refresh)
│   │   ├── guards/              # Access token guards & decorators (@CurrentUser)
│   │   ├── types/               # JWT payload and request interfaces
│   │   ├── auth.controller.ts   # Route definitions for /auth endpoints
│   │   ├── auth.module.ts       # Module declaration & JWT configuration
│   │   └── auth.service.ts      # Authentication business logic & token lifecycle
│   ├── database/                # Database layer
│   │   ├── database.module.ts   # Database provider module
│   │   ├── database.provider.ts # PostgreSQL connection pool & Drizzle client
│   │   ├── database.types.ts    # DB injection tokens & types
│   │   └── schema.ts            # Drizzle relational table schemas (users table)
│   ├── users/                   # User data access layer
│   │   ├── users.module.ts      # Users feature module
│   │   └── users.service.ts     # User CRUD, credentials & hash storage
│   ├── app.module.ts            # Root application module & global config
│   └── main.ts                  # Application entry point, CORS, and validation pipe
├── drizzle.config.ts            # Drizzle Kit migration configuration
└── .env.example                 # Template for required environment variables
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root of `nest-auth` (refer to `.env.example`):

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `PORT` | Application server port | `3000` |
| `NODE_ENV` | Runtime environment | `development` |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `ACCESS_TOKEN_SECRET` | Secret key used to sign access tokens | `your_access_token_secret` |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token lifespan | `15m` |
| `REFRESH_TOKEN_SECRET` | Secret key used to sign refresh tokens | `your_refresh_token_secret` |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `RESEND_API_KEY` | Resend API key for transactional emails | `re_xxxxxxxxxxxx` |
| `EMAIL_FROM` | Sender address for system emails | `Auth Trial <onboarding@resend.dev>` |
| `PASSWORD_RESET_URL` | Frontend URL for password reset links | `http://localhost:3001/reset-password` |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.x or v20.x+ recommended)
- **npm** (or `pnpm` / `yarn`)
- **PostgreSQL Database** (local instance or hosted provider like [Neon](https://neon.tech))

### 2. Installation
```bash
cd nest-auth
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials and JWT secrets
```

### 4. Database Setup & Migrations
Manage database schema using Drizzle Kit:

```bash
# Push schema directly to database
npx drizzle-kit push

# OR generate and run SQL migrations
npx drizzle-kit generate
npx drizzle-kit migrate

# Open Drizzle Studio web GUI
npx drizzle-kit studio
```

### 5. Run the Application
```bash
# Development mode with hot-reload
npm run start:dev

# Production build & run
npm run build
npm run start:prod
```

The server will start at `http://localhost:3000` (or your configured `PORT`).

---

## 📡 API Reference

All authentication endpoints are prefixed with `/auth`.

### 1. Register User
Creates a new account and returns the user profile with access and refresh tokens.

- **URL**: `POST /auth/register`
- **Auth Required**: No
- **Request Body**:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "StrongPassword123!"
}
```
- **Response**: `201 Created`
```json
{
  "user": {
    "id": "7f13b1f5-e214-4113-911a-3e819b2241cf",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatarUrl": null,
    "createdAt": "2026-09-29T14:30:00.000Z",
    "updatedAt": "2026-09-29T14:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 2. Login
Authenticates an existing user via email and password.

- **URL**: `POST /auth/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "email": "jane@example.com",
  "password": "StrongPassword123!"
}
```
- **Response**: `200 OK`
```json
{
  "user": {
    "id": "7f13b1f5-e214-4113-911a-3e819b2241cf",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatarUrl": null,
    "createdAt": "2026-09-29T14:30:00.000Z",
    "updatedAt": "2026-09-29T14:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 3. Refresh Access Token
Exchanges a valid refresh token for a newly rotated access token and refresh token pair.

- **URL**: `POST /auth/refresh`
- **Auth Required**: No (Token provided in body)
- **Request Body**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```
- **Response**: `200 OK`
```json
{
  "user": {
    "id": "7f13b1f5-e214-4113-911a-3e819b2241cf",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "avatarUrl": null,
    "createdAt": "2026-09-29T14:30:00.000Z",
    "updatedAt": "2026-09-29T14:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 4. Logout
Revokes the authenticated user's refresh token by clearing the stored hash in the database.

- **URL**: `POST /auth/logout`
- **Auth Required**: Yes (`Bearer <access_token>`)
- **Headers**:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Response**: `200 OK`
```json
{
  "success": true
}
```

---

### 5. Get Current User Profile
Retrieves sanitized profile details for the authenticated user.

- **URL**: `GET /auth/me`
- **Auth Required**: Yes (`Bearer <access_token>`)
- **Headers**:
  ```http
  Authorization: Bearer <accessToken>
  ```
- **Response**: `200 OK`
```json
{
  "id": "7f13b1f5-e214-4113-911a-3e819b2241cf",
  "name": "Jane Doe",
  "email": "jane@example.com",
  "avatarUrl": null,
  "createdAt": "2026-09-29T14:30:00.000Z",
  "updatedAt": "2026-09-29T14:30:00.000Z"
}
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## 🗺️ Roadmap

- [x] Dual-token authentication (Access Token + Refresh Token)
- [x] Argon2 password & refresh token hashing
- [x] Token invalidation / logout mechanism
- [x] Drizzle ORM schema with PostgreSQL
- [ ] Forgot Password & Reset Password email workflow via Resend
- [ ] Rate limiting & brute-force protection (`@nestjs/throttler`)
- [ ] Optional HttpOnly cookie support for Web Single Page Applications (SPA)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

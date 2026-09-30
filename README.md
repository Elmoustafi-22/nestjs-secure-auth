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
- **Google OAuth 2.0 Integration**:
  - Secure authorization code flow with anti-CSRF state token verification via short-lived HttpOnly cookies (`google_oauth_state`).
  - Automatic account provisioning and existing account linking by verified email.
  - Safe OAuth user model supporting passwordless accounts (`password_hash` nullable).
- **Dual-Token JWT Strategy**:
  - **Access Token**: Short-lived (15 minutes by default) Bearer token for authenticating protected routes.
  - **Refresh Token**: Long-lived (7 days by default) token for obtaining fresh token pairs without re-authenticating.
- **Hashed Refresh Tokens in Database**: Refresh tokens are never stored in plaintext in the database. Instead, they are hashed with Argon2 before persistence, preventing session hijacking even in the event of a database compromise.
- **HttpOnly Cookie Delivery**: Sets `access_token` and `refresh_token` as secure, Lax, HttpOnly cookies upon successful OAuth authentication.
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
| **[Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)** | Social login, identity verification, and profile synchronization |
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
│   │   ├── auth.service.ts      # Authentication business logic & token lifecycle
│   │   └── google-auth.service.ts # Google OAuth code exchange & profile fetching
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
| `FRONTEND_URL` | Allowed CORS origin and OAuth redirect target | `http://localhost:3001` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `ACCESS_TOKEN_SECRET` | Secret key used to sign access tokens | `your_access_token_secret` |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token lifespan | `15m` |
| `REFRESH_TOKEN_SECRET` | Secret key used to sign refresh tokens | `your_refresh_token_secret` |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifespan | `7d` |
| `GOOGLE_CLIENT_ID` | Google Cloud Console OAuth 2.0 Client ID | `your_client_id.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google Cloud Console OAuth 2.0 Client Secret | `your_client_secret` |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect callback URI | `http://localhost:3000/auth/google/callback` |
| `RESEND_API_KEY` | Resend API key for transactional emails | `re_xxxxxxxxxxxx` |
| `EMAIL_FROM` | Sender address for system emails | `Auth Trial <onboarding@resend.dev>` |
| `PASSWORD_RESET_URL` | Frontend URL for password reset links | `http://localhost:3001/reset-password` |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18.x or v20.x+ recommended)
- **npm** (or `pnpm` / `yarn`)
- **PostgreSQL Database** (local instance or hosted provider like [Neon](https://neon.tech))
- **Google Cloud Console Project** with OAuth 2.0 Web Client credentials enabled

### 2. Installation
```bash
cd nest-auth
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your PostgreSQL credentials, JWT secrets, and Google OAuth credentials
```

> **Google OAuth Setup Note**:
> In the [Google Cloud Console](https://console.cloud.google.com/apis/credentials), under **Authorized redirect URIs**, add your exact callback URL:
> `http://localhost:3000/auth/google/callback`

### 4. Database Setup & Migrations
Manage database schema using npm scripts configured with Drizzle Kit:

```bash
# Generate SQL migrations from schema
npm run db:generate

# Apply pending migrations to PostgreSQL database
npm run db:migrate

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
    "googleId": null,
    "githubId": null,
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
    "googleId": null,
    "githubId": null,
    "avatarUrl": null,
    "createdAt": "2026-09-29T14:30:00.000Z",
    "updatedAt": "2026-09-29T14:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 3. Initiate Google OAuth Flow
Generates a cryptographically random `state` parameter, stores it in a secure HttpOnly cookie (`google_oauth_state`), and redirects the client to the Google OAuth consent screen.

- **URL**: `GET /auth/google`
- **Auth Required**: No
- **Flow**:
  1. Sets cookie: `google_oauth_state` (HttpOnly, Lax, 15 min TTL).
  2. Redirects (`302`) to:
     ```text
     https://accounts.google.com/o/oauth2/v2/auth?client_id=...&redirect_uri=http://localhost:3000/auth/google/callback&response_type=code&scope=openid+email+profile&state=...
     ```

---

### 4. Google OAuth Callback
Receives the authorization code and state from Google, verifies the state against the cookie, exchanges the code for an access token, retrieves the user profile, provisions/links the account, and issues authentication cookies.

- **URL**: `GET /auth/google/callback`
- **Auth Required**: No
- **Query Parameters**:
  - `code`: Authorization code returned by Google.
  - `state`: State parameter returned by Google.
- **Workflow**:
  1. Validates `state` against `google_oauth_state` cookie (protects against CSRF).
  2. Clears the `google_oauth_state` cookie.
  3. Exchanges `code` for Google access token via Google OAuth 2.0 Token API.
  4. Fetches user profile (`email`, `name`, `sub`/`googleId`, `picture`) from Google UserInfo endpoint.
  5. Finds or creates user record in PostgreSQL (links `googleId` if account with email exists, or creates new OAuth user).
  6. Issues JWT `accessToken` and `refreshToken`, storing the hashed refresh token in the database.
  7. Sets `access_token` and `refresh_token` as HttpOnly cookies on the response:
     - `access_token` (15 min TTL)
     - `refresh_token` (7 days TTL)
  8. Redirects:
     - **Success**: `${FRONTEND_URL}/auth/callback`
     - **Invalid State**: `${FRONTEND_URL}/auth/callback?error=invalid_oauth_state`
     - **Failure**: `${FRONTEND_URL}/auth/callback?error=google_auth_failed`

---

### 5. Refresh Access Token
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
    "googleId": null,
    "githubId": null,
    "avatarUrl": null,
    "createdAt": "2026-09-29T14:30:00.000Z",
    "updatedAt": "2026-09-29T14:30:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsIn..."
}
```

---

### 6. Logout
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

### 7. Get Current User Profile
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
  "googleId": "101191662488808516242",
  "githubId": null,
  "avatarUrl": "https://lh3.googleusercontent.com/...",
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
- [x] Google OAuth 2.0 integration (code flow, state verification, cookie auth)
- [x] Dynamic account linking (Email matching + Google ID persistence)
- [ ] GitHub OAuth 2.0 integration
- [ ] Forgot Password & Reset Password email workflow via Resend
- [ ] Rate limiting & brute-force protection (`@nestjs/throttler`)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).


[← Back to Monorepo Root](../../README.md)

# Auth Microservice (`@airline/auth`)

The **Auth Microservice** is a dedicated identity and access management service responsible for user registration, authentication, role-based access control (RBAC), and JSON Web Token (JWT) lifecycle management across the Airline Management platform.

---

## Service Responsibilities

- **Identity Management:** User registration, profile persistence, and credential verification.
- **Authentication:** Secure credential verification using bcrypt password hashing and token generation.
- **Role-Based Access Control (RBAC):** Dynamic role assignment (e.g. `CUSTOMER`, `ADMIN`) and role verification.
- **Token Operations:** JWT token issuance, signature verification, expiration enforcement, and bearer extraction.
- **Input Sanitization & Validation:** Strict payload validation, bounds checking, email trimming, and lowercasing using Zod.

---

## Tech Stack

| Technology                           | Purpose                                                                      |
| :----------------------------------- | :--------------------------------------------------------------------------- |
| **Node.js & Express**                | Runtime environment and lightweight HTTP application framework               |
| **MySQL & Sequelize ORM**            | Relational data persistence, schema migrations, and transactional guarantees |
| **Zod**                              | Type-safe runtime schema validation for request payloads                     |
| **JSON Web Tokens (`jsonwebtoken`)** | Cryptographic token signing and payload verification                         |
| **bcrypt**                           | Secure one-way password hashing (salt rounds: 10)                            |
| **Jest & Supertest**                 | Automated unit and integration testing engine                                |

---

## Architectural Design

The service follows a strict **Layered Clean Architecture** where each layer maintains isolated responsibilities:

```text
Request ──> [ Routes ] ──> [ Middlewares (Zod / Auth) ] ──> [ Controllers ]
                                                                   │
                                                                   ▼
Response <── [ Error Middleware ] <── [ Repositories ] <── [ Services ]
                                            │
                                            ▼
                                    [ Sequelize Models ]
                                            │
                                            ▼
                                     [ MySQL Database ]
```

### Layer Breakdown

- **`src/app.js`:** Configures Express application, mounts middlewares, registers `/api` routes, and defines the centralized error handler. Decoupled from port binding for in-memory testing.
- **`src/index.js`:** Production entrypoint that connects to MySQL and binds `app` to `PORT`.
- **`src/routes/`:** Defines route paths and binds validators to controller actions.
- **`src/middlewares/`:** Intercepts requests for schema validation (`validate-request.js`), auth header verification (`auth-request-validator.js`), and centralized error formatting (`error-middleware.js`).
- **`src/controllers/`:** Extracts request payloads, calls the domain service layer, and shapes the standard response envelope.
- **`src/services/`:** Core business logic (login verification, password checking, token creation, admin status checks).
- **`src/repositories/`:** Database abstraction layer managing transactional user creation, role associations, and queries.
- **`src/models/`:** Sequelize models defining database schemas, associations, and lifecycle hooks (`beforeCreate` password hashing, `toJSON` password stripping).
- **`src/schemas/`:** Declarative Zod schemas defining payload bounds and mutations.
- **`src/utils/`:** Shared response envelopes, error classes (`AppError`, `ValidationError`), and token extraction helpers.

---

## Database Models & Relationships

The service uses a relational data model with **UUID v4** primary keys for users:

- **`User`:** Stores user credentials (`id: UUID`, `email: STRING (unique)`, `password: STRING`).
- **`Role`:** Stores application roles (`id: INTEGER`, `role: STRING`). Seeded with `CUSTOMER` and `ADMIN`.
- **`User_Roles`:** Many-to-many junction table associating users with assigned roles.

**Transactional Guarantee:** During signup, user creation and default role assignment are executed within an ACID database transaction. Any failure triggers an automatic rollback to prevent orphaned user records.

---

## Standard Response Envelope

Every endpoint returns a consistent JSON envelope adhering to the monorepo-wide standard:

### Success (`HTTP 200 / 201`)

```json
{
    "success": true,
    "message": "Operation completed successfully",
    "data": { ... },
    "error": {}
}
```

### Error (`HTTP 400 / 401 / 403 / 404 / 409 / 500`)

```json
{
  "success": false,
  "message": "Operation failed",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "Field-level or system-level error explanation"
  }
}
```

---

## API Endpoints Summary

| Method | Endpoint          | Auth Required | Description                                   |
| :----- | :---------------- | :------------ | :-------------------------------------------- |
| `GET`  | `/health`         | No            | Service health check                          |
| `POST` | `/api/v1/signup`  | No            | Register user with default `CUSTOMER` role    |
| `POST` | `/api/v1/signin`  | No            | Authenticate user and return signed JWT       |
| `GET`  | `/api/v1/verify`  | Yes           | Verify token validity and return user details |
| `GET`  | `/api/v1/isAdmin` | Yes           | Verify if authenticated user has `ADMIN` role |

For complete request/response schemas, validation rules, and status codes, see the [**Auth API Documentation**](./API_DOCUMENTATION.md).

---

## Testing & Quality Assurance

The service includes an automated test suite with near-complete test coverage:

- **14 Test Suites** | **99 Tests Passing (100%)**
- **99.64% Line Coverage** | **100% Function Coverage**
- **Unit Tests:** Full isolation using Jest mocks for repositories, Sequelize transactions, and bcrypt.
- **Integration Tests:** End-to-end route verification using Supertest against the decoupled Express app.

For full testing architecture, edge case matrix, and execution guidelines, see the [**Auth Testing Guide**](./tests/TESTING.md).

---

## Getting Started

### 1. Environment Configuration

Create a `.env` file in `apps/auth/`:

```env
PORT=3001
JWT_KEY=your_jwt_secret_key
JWT_EXPIRY=1d
```

Database connection settings are located in `src/config/config.json`.

### 2. Database Migrations & Seeds

```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 3. Run Development Server

```bash
# Run locally from apps/auth
npm run dev

# Or run from monorepo root
npm run dev:auth
```

### 4. Run Tests

```bash
# Run locally from apps/auth
npm test                # Run all tests sequentially
npm run test:watch      # Interactive watch mode
npm run test:coverage   # Generate coverage report

# Or run from monorepo root via workspace
npm test -w @airline/auth
npm run test:watch -w @airline/auth
npm run test:coverage -w @airline/auth
```

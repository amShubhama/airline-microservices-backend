# Auth Service — Testing Guide & Strategy (`TESTING.md`)

This document outlines the testing architecture, strategy, and execution commands for the **Auth Microservice** (`@airline/auth`).

---

## 1. Testing Philosophy & Pyramid

We follow the standard **Testing Pyramid** approach to keep tests fast, deterministic, and easy to maintain:

```text
       /\
      /  \       Integration Tests (Supertest)
     /----\      - Tests HTTP routes, middleware chain, and status codes
    /      \     - Uses decoupled Express app without opening network ports
   /--------\
  /   Unit   \   Unit Tests (Jest)
 /   Tests    \  - Fast, isolated component tests with mocks
/______________\ - Services, repositories, schemas, middlewares, utilities
```

### Why this approach?

- **Unit Tests (Base):** Validate business logic, edge cases, error conditions, and input schemas in total isolation using Jest mocks. They run in milliseconds and don't require an active MySQL instance.
- **Integration Tests (Middle):** Validate that the full Express request-response pipeline works correctly (route $\rightarrow$ validator $\rightarrow$ controller $\rightarrow$ error middleware) using **Supertest**.

---

## 2. Key Architecture Decision: Decoupling `app.js` and `index.js`

To make API testing reliable:

- **`src/app.js`:** Configures Express middlewares, mounts `/api` routes, and defines the global error handler. It exports `app` without listening on a port.
- **`src/index.js`:** Imports `app`, connects to the database, and calls `app.listen(PORT)`.

**Benefit:** Supertest can directly test `app` in-memory. This prevents `EADDRINUSE` port collision errors and ensures clean test teardowns.

---

## 3. Test Directory Organization

The test directory mirrors the structure of `src/`:

```text
tests/
├── TESTING.md                              # This testing guide
├── fixtures/
│   └── user.fixture.js                     # Shared mock users, payloads, and tokens
├── integration/
│   ├── auth-routes.test.js                 # Supertest tests for /api/v1 (signup, signin, verify, isAdmin)
│   └── health.test.js                      # Tests for /health and 404 handler
└── unit/
    ├── controllers/
    │   └── user-controller.test.js         # HTTP status codes & error delegation to next()
    ├── middlewares/
    │   ├── auth-request-validator.test.js  # Token extraction and 401 handling
    │   ├── error-middleware.test.js        # Error mapping (AppError, Sequelize, JWT)
    │   └── validate-request.test.js        # Zod request validation (body, query, params)
    ├── models/
    │   └── user-model.test.js              # Password hashing hook (beforeCreate) & toJSON()
    ├── repositories/
    │   └── user-repository.test.js         # Database transactions, commit/rollback, queries
    ├── schemas/
    │   └── user-schemas.test.js            # Input bounds, required fields, string trimming
    ├── services/
    │   └── user-service.test.js            # Auth business logic (signup, signin, verify, isAdmin)
    └── utils/
        ├── app-error.test.js               # Custom AppError instantiation
        ├── response.test.js                # Success & failure response shapes
        ├── token-helper.test.js            # Bearer token regex parsing & fallback
        └── validation-error.test.js        # Formatting Zod and Sequelize errors
```

---

## 4. Key Scenarios & Edge Cases Tested

| Layer                | What We Test                   | Key Edge Cases Covered                                                                                                                               |
| :------------------- | :----------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Schemas (Zod)**    | `signupSchema`, `signinSchema` | Short passwords (< 6 chars), long passwords (> 100 chars), invalid email formats, whitespace trimming, and email lowercasing.                        |
| **Token Helper**     | `extractToken`                 | Case-insensitive `Bearer` prefix, missing token strings, alternative schemes (Basic/Digest), and raw token fallback for `x-access-token`.            |
| **Auth Middleware**  | `validateAuthToken`            | Missing auth headers (returns 401 `AppError`), invalid token format, and token attachment to `req.token`.                                            |
| **Service Layer**    | `UserService`                  | Invalid credentials (wrong email or password), expired JWTs, forged signatures, users deleted after token creation, and admin role checks.           |
| **Repository Layer** | `UserRepository`               | Transaction commit on user + default role creation, transaction rollback if default role is missing, and rollback on DB write error.                 |
| **Error Middleware** | `errorHandler`                 | Correct HTTP status codes for `AppError`, Sequelize unique/validation errors, JWT expiration errors, and hiding internal stack traces in production. |
| **Model**            | `User`                         | Hashing password with bcrypt in `beforeCreate` hook and stripping `password` when converting to JSON (`toJSON`).                                     |
| **API Routes**       | `/api/v1/*`                    | End-to-end HTTP responses: 201 Created on signup, 200 OK on signin/verify, 400 on bad payload, 401 on missing auth, and 404 on unmapped routes.      |

---

## 5. Mocking Strategy

- **Repositories in Services:** We mock `UserRepository` methods (`create`, `getByEmail`, `getById`) using `jest.mock()` to test business logic independently of database state.
- **Sequelize in Repositories:** We mock `User`, `Role`, and `sequelize.transaction()` to assert that `.commit()` is called on success and `.rollback()` on failure.
- **Bcrypt:** We test password comparison branches using `jest.spyOn(bcrypt, 'compare')`.
- **JWT:** We sign and verify real JWT tokens in unit tests using a deterministic test secret (`process.env.JWT_KEY || 'testSecretKey'`).

---

## 6. Execution Commands

All commands can be run from the root directory or inside `apps/auth`:

```bash
# Run all tests
npm test

# Run tests in watch mode (ideal during local development)
npm run test:watch

# Run tests with code coverage report
npm run test:coverage

# Run a specific test file
npx jest apps/auth/tests/unit/services/user-service.test.js

# Run tests matching a specific name or keyword
npx jest -t "signIn"
```

---

## 7. Pre-commit Automation

Our Git pre-commit hook (configured with **Husky** and **lint-staged**) automatically keeps the codebase clean:

1. Runs `eslint --fix` on staged JS files.
2. Runs `prettier --write` on staged files.
3. Runs `jest --findRelatedTests --bail --passWithNoTests` to execute **only the tests related to the changed files**.
4. If any test or lint rule fails, the commit is blocked automatically.

---

## 8. Conventions for Adding New Tests

1. **File naming:** Name test files `<component>.test.js`.
2. **Location:** Place unit tests in `tests/unit/<layer>/` mirroring the `src/` path.
3. **Data reuse:** Use [`tests/fixtures/user.fixture.js`](./fixtures/user.fixture.js) for test users and payloads instead of re-declaring mock data.
4. **Clean state:** Jest is configured with `clearMocks: true` and `restoreMocks: true` so tests never leak mock implementations to one another.

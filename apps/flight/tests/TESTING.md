# Flight Service — Testing Guide & Strategy (`TESTING.md`)

This document outlines the testing architecture, testing strategy, and execution commands for the **Flight Microservice** (`@airline/flight`).

---

## 1. Testing Philosophy & Pyramid

We follow the standard **Testing Pyramid** approach to keep our test suite fast, deterministic, and easy to maintain:

```text
       /\
      /  \       Integration Tests (Supertest)
     /----\      - Tests HTTP routes, role guards, input validation, and status codes
    /      \     - Uses decoupled Express app in-memory without opening network ports
   /--------\
  /   Unit   \   Unit Tests (Jest)
 /   Tests    \  - Fast, isolated component tests with mocks
/______________\ - Services, repositories, schemas, models, middlewares, utilities
```

### Why this approach?

- **Unit Tests (Base):** Validate complex business logic, flight schedule overlaps, seat bounds, capacity reduction safety, database queries, and input schemas in total isolation using Jest mocks. They run in seconds without requiring an active MySQL database connection.
- **Integration Tests (Middle):** Validate that the full Express request-response pipeline functions seamlessly (route $\rightarrow$ role-middleware $\rightarrow$ validator $\rightarrow$ controller $\rightarrow$ error middleware) using **Supertest**.

---

## 2. Key Architecture Decision: Decoupling `app.js` and `index.js`

To make API integration testing reliable:

- **`src/app.js`:** Configures Express middleware, mounts `/api` and `/health` routes, and defines the global error handler. It exports `app` without binding to a network port.
- **`src/index.js`:** Imports `app`, connects to the database, and calls `app.listen(PORT)`.

**Benefit:** Supertest can directly query `app` in-memory. This prevents `EADDRINUSE` port collision errors, avoids database socket leaks, and ensures rapid test teardowns.

---

## 3. Test Directory Organization

The test directory directly mirrors the structure of `src/`:

```text
tests/
├── TESTING.md                              # This testing guide
├── integration/
│   ├── airplane-routes.test.js             # Supertest tests for /api/v1/airplanes
│   ├── airport-routes.test.js              # Supertest tests for /api/v1/airports
│   ├── city-routes.test.js                 # Supertest tests for /api/v1/cities
│   ├── flight-routes.test.js               # Supertest tests for /api/v1/flights & seat update
│   ├── health.test.js                      # Tests for /health and 404 handler
│   └── seat-routes.test.js                 # Supertest tests for /api/v1/seats & batch creation
└── unit/
    ├── middlewares/
    │   ├── error-middleware.test.js        # Error mapping (AppError, Sequelize, Foreign Key)
    │   └── role-middleware.test.js         # x-user-role: ADMIN check and 403 enforcement
    ├── models/
    │   ├── airplane.model.test.js          # Capacity bounds and modelNumber validation
    │   ├── flight.model.test.js            # Airport codes uppercasing, time order, seat bounds
    │   └── seat.model.test.js              # Column uppercasing, row bounds, default enum
    ├── repositories/
    │   ├── airplane-repository.test.js     # Flight dependency checks and seat joins
    │   ├── airport-repository.test.js      # IATA code lookup and flight dependency checks
    │   ├── city-repository.test.js         # City queries with eager-loaded airports
    │   ├── crud-repository.test.js         # Generic base CRUD operations (create, get, update, destroy)
    │   ├── flight-repository.test.js       # Overlap detection, custom filters, row locking
    │   └── seat-repository.test.js         # Coordinate indexing, seat counts, bulk creation
    ├── schemas/
    │   └── schemas.test.js                 # Zod validation schemas for all domain resources
    ├── services/
    │   ├── airplane-service.test.js        # Capacity downscaling guards and flight checks
    │   ├── airport-service.test.js         # Airport CRUD and flight dependency enforcement
    │   ├── city-service.test.js            # City CRUD and airport dependency enforcement
    │   ├── flight-service.test.js          # Schedule overlap, timetable checks, filter compiler
    │   └── seat-service.test.js            # Aircraft capacity limits and coordinate collisions
    ├── utils/
    │   ├── app-error.test.js               # Custom AppError instantiation
    │   ├── response.test.js                # Success & failure response envelope shapes
    │   └── validation-error.test.js        # Formatting Zod and Sequelize validation errors
    └── validators/
        └── base-validator.test.js          # Request parsing middleware and ID param checks
```

---

## 4. Key Scenarios & Edge Cases Tested

| Layer                            | What We Test                                                                       | Key Edge Cases Covered                                                                                                                                                                                                                                 |
| :------------------------------- | :--------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Domain Schemas (Zod)**         | `flightSchemas`, `airplaneSchemas`, `airportSchemas`, `citySchemas`, `seatSchemas` | Identical departure/arrival airport codes, chronological arrival earlier than departure, negative/zero prices, traveller counts (> 9), non-IATA codes, and empty update payloads.                                                                      |
| **Seat Inventory & Concurrency** | `FlightRepository.updateRemainingSeats`                                            | Row-level pessimistic locking (`SELECT ... FOR UPDATE`), transaction rollback on insufficient seats, status restrictions (rejects reservations on cancelled/departed flights), and capping remaining seats to `totalSeats` upon cancellation releases. |
| **Fleet Capacity Protection**    | `AirplaneService.updateAirplane`                                                   | Blocks reducing aircraft capacity below physical configured seats, and blocks reduction below existing flight booking totals.                                                                                                                          |
| **Referential Integrity**        | `CityService`, `AirportService`, `AirplaneService`                                 | Blocks deletion of cities with active airports, blocks deletion of airports with scheduled flights, and blocks deletion of airplanes assigned to flights.                                                                                              |
| **Flight Overlap Detection**     | `FlightService.createFlight` & `updateFlight`                                      | Detects overlapping departure/arrival windows for the same aircraft to prevent impossible flight schedules.                                                                                                                                            |
| **Role Middleware**              | `requireAdmin`                                                                     | Rejects requests with missing `x-user-role` (403 Forbidden), rejects non-admin roles (e.g. `CUSTOMER`), and passes valid `ADMIN` users to next middleware.                                                                                             |
| **Error Middleware**             | `errorHandler`                                                                     | Formats `AppError`, Sequelize unique constraint errors (`409 Conflict`), foreign key restriction errors (`400 Bad Request`), Zod `ValidationError` (`400 Bad Request`), and unhandled errors (`500 Internal Server Error`).                            |
| **Sequelize Models**             | `Flight`, `Airplane`, `Airport`, `City`, `Seat`                                    | `beforeValidate` hooks auto-uppercasing codes and seat columns, defaulting `remainingSeats` to `totalSeats`, and validating positive coordinates.                                                                                                      |
| **API Routes (Integration)**     | `/api/v1/*`                                                                        | End-to-end HTTP status codes: 201 Created on valid POST, 200 OK on GET/PATCH/DELETE, 400 on malformed payloads, 403 on missing admin role, 404 on non-existent records, and 409 on duplicate entries.                                                  |

---

## 5. Mocking Strategy

- **Repositories in Services:** We mock repository methods (`create`, `get`, `findByCode`, `findOverlappingFlight`) using `jest.spyOn()` to test business logic independently of database state.
- **Sequelize Transactions & Locks:** In unit repository tests, we mock `db.sequelize.transaction()` and `lock: transaction.LOCK.UPDATE` to verify that `.commit()` is called on success and `.rollback()` on failure.
- **Isolated Integration Tests:** Supertest routes use spies on service layer methods (e.g. `jest.spyOn(FlightService, 'getAllFlights')`) to verify routing, validation middlewares, role checks, and response serialization without spinning up external dependencies.

---

## 6. Execution Commands

All commands can be run from the root directory or inside `apps/flight`:

```bash
# Run all tests sequentially
npm test

# Run tests in watch mode (ideal during local development)
npm run test:watch

# Run tests with code coverage report
npm run test:coverage

# Run a specific test file
npx jest apps/flight/tests/unit/services/flight-service.test.js

# Run tests matching a specific describe block or test name
npx jest -t "updateRemainingSeats"
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
2. **Location:** Place unit tests in `tests/unit/<layer>/` mirroring the `src/` path, and route tests in `tests/integration/`.
3. **Data isolation:** Create focused payloads in each test suite, avoiding shared mutable state.
4. **Clean state:** Jest is configured with `clearMocks: true` and `restoreMocks: true` so mocks never leak across tests.

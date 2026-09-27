[← Back to Monorepo Root](../../README.md)

# Flight Microservice (`@airline/flight`)

The **Flight Microservice** is a core operational service responsible for aircraft fleet management, airport hubs, cities, flight schedules, seat map configurations, and real-time seat inventory. It powers search and discovery across routes, prices, and dates, and provides concurrency-safe seat reservation capabilities via database-level pessimistic locking (`SELECT ... FOR UPDATE`).

---

## Service Responsibilities

- **Flight Scheduling & Lifecycle:** Creating, updating, querying, and cancelling flights with departure/arrival validation and timetable conflict detection.
- **Flight Discovery & Search Engine:** Multi-criteria flight search engine with support for origin-destination pairs (`trips`), airport IATA codes, departure dates, price ranges, seat availability, and multi-column sorting.
- **Aircraft Fleet Management:** Managing airplane models and capacities, preventing dangerous capacity downscaling below booked flights or configured seats.
- **Geographic Network (Airports & Cities):** Managing airports with unique 3-letter IATA codes mapped to host municipalities, with strict referential safety.
- **Seat Layout & Inventory Configuration:** Single and batch creation of physical aircraft seat maps across cabin classes (`BUSINESS`, `ECONOMY`, `PREMIUM_ECONOMY`, `FIRST_CLASS`).
- **High-Concurrency Seat Locking:** Transactional seat deduction and restoration using pessimistic row locking to prevent overselling during concurrent booking spikes.
- **Input Sanitization & Schema Validation:** Strict payload validation, data normalization (IATA code uppercasing, date parsing, seat bound checks) using Zod schemas.

---

## Tech Stack

| Technology                | Purpose                                                                       |
| :------------------------ | :---------------------------------------------------------------------------- |
| **Node.js & Express**     | Runtime environment and lightweight RESTful HTTP application framework        |
| **MySQL & Sequelize ORM** | Relational persistence, foreign key enforcement, migrations, and ACID locking |
| **Zod**                   | Declarative, type-safe runtime schema validation for requests and queries     |
| **Jest & Supertest**      | Comprehensive automated unit and integration testing harness                  |

---

## Architectural Design

The service implements a **Layered Clean Architecture**, decoupling HTTP routing, request validation, business logic, and database access:

```text
Request ──> [ Routes ] ──> [ Middlewares (Zod / Role) ] ──> [ Controllers ]
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

- **`src/app.js`:** Express application initialization, JSON parsing, health check route, 404 handler, and centralized error handler. Decoupled from port listening for isolated testing.
- **`src/index.js`:** Production entrypoint that binds `app` to `PORT` after verifying database connectivity.
- **`src/routes/`:** REST routing hierarchy (`/api/v1/flights`, `/airplanes`, `/airports`, `/cities`, `/seats`).
- **`src/middlewares/`:** Intercepts incoming requests:
  - `role-middleware.js`: Enforces `x-user-role: ADMIN` for protected mutations.
  - `error-middleware.js`: Centralized error interceptor mapping Sequelize errors, `ValidationError`, and `AppError` to the standard response envelope.
- **`src/validators/`:** Bridge between Zod schemas and Express middleware pipeline.
- **`src/schemas/`:** Declarative Zod schemas defining parameter, query, and payload constraints with custom cross-field refinements.
- **`src/controllers/`:** Extracts request inputs, delegates to domain services, and formats standard HTTP responses.
- **`src/services/`:** Business rules (timetable conflict detection, airport verification, capacity checks, custom search filter compilation).
- **`src/repositories/`:** Data persistence layer extending `CrudRepository`, encapsulating Sequelize queries, eager-loading associations, and row-level locking transactions.
- **`src/models/`:** Sequelize models defining schemas, hooks, validations, and relational associations.
- **`src/utils/`:** Shared response helpers, custom error classes, and date comparison utilities.

---

## Database Models & Relationships

The service operates on a relational data model with foreign key safeguards:

```text
   ┌──────────┐ 1        * ┌───────────┐ 1       * ┌────────┐
   │   City   ├────────────┤  Airport  ├───────────┤ Flight │
   └──────────┘            └───────────┘ (dep/arr) └───┬────┘
                                                       │ *
                                                       │
                                                       │ 1
   ┌──────────┐ 1        * ┌───────────┐               │
   │ Airplane ├────────────┤   Seat    │               │
   └────┬─────┘            └───────────┘               │
        │ 1                                            │
        └──────────────────────────────────────────────┘
```

- **`Airplane`:** Aircraft specifications (`id`, `modelNumber`, `capacity`). Has many `Flights` (`RESTRICT`) and many `Seats` (`CASCADE`).
- **`City`:** Urban hubs (`id`, `name`). Has many `Airports` (`RESTRICT`).
- **`Airport`:** Airport hubs (`id`, `name`, `code: CHAR(3)`, `address`, `cityId`). Belongs to `City`. Has many departing and arriving `Flights` (`RESTRICT`).
- **`Flight`:** Scheduled flight operations (`id`, `flightNumber`, `airplaneId`, `departureAirportCode`, `arrivalAirportCode`, `departureTime`, `arrivalTime`, `price`, `boardingGate`, `totalSeats`, `remainingSeats`, `status`).
- **`Seat`:** Physical seat layout (`id`, `airplaneId`, `row`, `col: CHAR(1)`, `type`). Unique composite constraint on `(airplaneId, row, col)`.

### Concurrency & Transactional Guarantees

- **Pessimistic Row Locking:** During seat reservations (`PATCH /flights/:id/seats`), the service executes `SELECT ... FOR UPDATE` within a Sequelize ACID transaction. Concurrent reservation attempts queue at the database lock, preventing race conditions and negative seat inventory.
- **Referential Integrity:** Deletions of Airplanes, Airports, or Cities are blocked if active child flights or airports exist, protecting relational consistency.

---

## Standard Response Envelope

Every endpoint returns a consistent JSON contract matching the monorepo standard:

### Success (`HTTP 200 / 201`)

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "error": {}
}
```

### Error (`HTTP 400 / 403 / 404 / 409 / 500`)

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

### Flights

| Method   | Endpoint                    | Role / Auth    | Description                                                |
| :------- | :-------------------------- | :------------- | :--------------------------------------------------------- |
| `GET`    | `/api/v1/flights`           | Public         | Search and filter flights with pagination and sorting      |
| `GET`    | `/api/v1/flights/:id`       | Public         | Get flight details with aircraft and airport metadata      |
| `POST`   | `/api/v1/flights`           | Admin          | Schedule a new flight with overlap and timetable checks    |
| `PATCH`  | `/api/v1/flights/:id`       | Admin          | Update flight timings, status, boarding gate, or pricing   |
| `DELETE` | `/api/v1/flights/:id`       | Admin          | Cancel and delete a flight                                 |
| `PATCH`  | `/api/v1/flights/:id/seats` | Public/Service | Concurrency-safe seat reservation/release with row locking |

### Airplanes

| Method   | Endpoint                | Role / Auth | Description                                                |
| :------- | :---------------------- | :---------- | :--------------------------------------------------------- |
| `GET`    | `/api/v1/airplanes`     | Public      | List all registered airplanes                              |
| `GET`    | `/api/v1/airplanes/:id` | Public      | Get airplane specifications by ID                          |
| `POST`   | `/api/v1/airplanes`     | Admin       | Register a new airplane model and passenger capacity       |
| `PATCH`  | `/api/v1/airplanes/:id` | Admin       | Update airplane capacity (safeguarded against downscaling) |
| `DELETE` | `/api/v1/airplanes/:id` | Admin       | Delete an airplane (blocked if flights assigned)           |

### Airports & Cities

| Method   | Endpoint                      | Role / Auth | Description                                         |
| :------- | :---------------------------- | :---------- | :-------------------------------------------------- |
| `GET`    | `/api/v1/airports`            | Public      | List all airports sorted by IATA code               |
| `GET`    | `/api/v1/airports/:id`        | Public      | Get airport details by numeric ID                   |
| `GET`    | `/api/v1/airports/code/:code` | Public      | Get airport details by 3-letter IATA code           |
| `POST`   | `/api/v1/airports`            | Admin       | Create a new airport mapped to a city               |
| `PATCH`  | `/api/v1/airports/:id`        | Admin       | Update airport name or city association             |
| `DELETE` | `/api/v1/airports/:id`        | Admin       | Delete an airport (blocked if flights reference it) |
| `GET`    | `/api/v1/cities`              | Public      | List all registered cities                          |
| `GET`    | `/api/v1/cities/:id`          | Public      | Get city details with associated airports           |
| `POST`   | `/api/v1/cities`              | Admin       | Register a new city                                 |
| `PATCH`  | `/api/v1/cities/:id`          | Admin       | Update city name                                    |
| `DELETE` | `/api/v1/cities/:id`          | Admin       | Delete a city (blocked if airports attached)        |

### Seats

| Method | Endpoint                                    | Role / Auth | Description                                            |
| :----- | :------------------------------------------ | :---------- | :----------------------------------------------------- |
| `GET`  | `/api/v1/seats`                             | Public      | List seats configured for an aircraft (`?airplaneId=`) |
| `GET`  | `/api/v1/seats/airplanes/:airplaneId`       | Public      | List seats configured for an aircraft                  |
| `POST` | `/api/v1/seats`                             | Admin       | Add a single seat coordinate                           |
| `POST` | `/api/v1/seats/airplanes/:airplaneId/batch` | Admin       | Bulk generate seat layout for an aircraft              |

For full request/response schemas, validation rules, and error envelopes, refer to the [**Flight Service API Documentation**](./API_DOCUMENTATION.md).

---

## Testing & Quality Assurance

The service contains an enterprise test suite covering unit models, services, repositories, validators, and Supertest integration routes:

- **27 Test Suites** | **239 Tests Passing (100%)**
- **94.75% Line Coverage** | **94.73% Function Coverage**
- **Unit Tests:** Isolated testing of repositories, services, and middlewares with complete mocking.
- **Integration Tests:** End-to-end route execution testing valid payloads, status codes, Zod errors, and role boundaries against the decoupled Express app.

For full testing architecture, edge case matrix, and execution guidelines, see the [**Flight Testing Guide**](./tests/TESTING.md).

---

## Getting Started

### 1. Environment Configuration

Create a `.env` file in `apps/flight/`:

```env
PORT=3002
NODE_ENV=development
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=flight_db
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DIALECT=mysql
```

### 2. Database Migrations & Seeds

```bash
# Run migrations from apps/flight
npx sequelize-cli db:migrate

# Seed initial cities, airports, airplanes, seats, and flights
npx sequelize-cli db:seed:all
```

### 3. Run Development Server

```bash
# Run locally from apps/flight
npm run dev

# Or run from monorepo root
npm run dev:flight
```

### 4. Run Tests

```bash
# Run locally from apps/flight
npm test                # Run all test suites
npm run test:watch      # Interactive watch mode
npm run test:coverage   # Generate code coverage report

# Or run from monorepo root via workspace
npm test -w @airline/flight
npm run test:coverage -w @airline/flight
```

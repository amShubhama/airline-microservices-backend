# Airline Management System — Microservices Backend

A modular, enterprise-grade backend platform built with **Node.js**, **Express**, **MySQL**, **Sequelize ORM**, and **RabbitMQ**, structured as an **npm workspaces monorepo**.

The system implements a domain-driven microservices architecture where services operate independently, encapsulate their own persistence layers, and interact through synchronous HTTP APIs (via an API Gateway) and asynchronous message queues for event-driven workflows.

---

## System Architecture

The architecture enforces single-responsibility microservices behind an API Gateway that serves as the unified reverse proxy and request router for client applications:

```text
                           ┌────────────────────────┐
                           │   Client Applications  │
                           └───────────┬────────────┘
                                       │ HTTP / REST
                                       ▼
                           ┌────────────────────────┐
                           │   API Gateway (:3000)   │
                           │   - Reverse Proxy      │
                           │   - Request Routing    │
                           │   - Rate & Auth Proxy  │
                           └───────────┬────────────┘
                                       │
         ┌─────────────────────────────┼────────────────────────────┐
         │ HTTP                        │ HTTP                       │ HTTP
         ▼                             ▼                            ▼
┌──────────────────┐          ┌──────────────────┐         ┌──────────────────┐
│   Auth Service   │          │  Flight Service  │         │ Booking Service  │
│      (:3001)     │          │      (:3002)     │         │      (:3003)     │
│  - JWT & Identity│          │  - Flights/Seats │         │  - Reservations  │
│  - RBAC & Roles  │          │  - Airports/City │         │  - Idempotency   │
│  - MySQL / UUID  │          │  - MySQL DB      │         │  - MySQL DB      │
└──────────────────┘          └──────────────────┘         └─────────┬────────┘
                                                                     │ Message
                                                                     │ Events
                                                                     ▼
                                                           ┌──────────────────┐
                                                           │  RabbitMQ Queue  │
                                                           │  - Exchange/Bus  │
                                                           └─────────┬────────┘
                                                                     │ Consume
                                                                     ▼
                                                           ┌──────────────────┐
                                                           │   Notification   │
                                                           │  Service (:3004) │
                                                           │  - Email Alerts  │
                                                           │  - Ticket Crons  │
                                                           └──────────────────┘
```

### Architectural Principles

- **Decoupled Deployments:** Each microservice maintains its own dependency tree, configuration, database schema, and test suite.
- **Unified Entry Point:** Clients interact exclusively with the API Gateway; internal service topologies are never directly exposed to public networks.
- **Asynchronous Reliability:** High-latency or side-effect operations (e.g., sending booking confirmation emails) are offloaded to RabbitMQ to keep user-facing request paths fast and resilient against service outages.
- **Shared Code Quality Standards:** Monorepo-level tooling guarantees that formatting, linting rules, and pre-commit checks are enforced uniformly across every workspace.

---

## Microservices Directory & Status

| Service                  | Workspace                | Port   | Domain Responsibility                                               | Status                 | Documentation & Specs                                                                                                                           |
| :----------------------- | :----------------------- | :----- | :------------------------------------------------------------------ | :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------- |
| **API Gateway**          | `@airline/api-gateway`   | `3000` | Reverse proxy routing, endpoint aggregation, request forwarding     | Active                 | [`apps/api-gateway`](./apps/api-gateway)                                                                                                        |
| **Auth Service**         | `@airline/auth`          | `3001` | User identity, password encryption, JWT issuance/verification, RBAC | **Completed & Tested** | [Service README](./apps/auth/README.md) \| [API Specs](./apps/auth/API_DOCUMENTATION.md) \| [Testing Guide](./apps/auth/tests/TESTING.md)       |
| **Flight Service**       | `@airline/flight`        | `3002` | Manages airports, airplanes, cities, flights, and seat inventories  | **Completed & Tested** | [Service README](./apps/flight/README.md) \| [API Specs](./apps/flight/API_DOCUMENTATION.md) \| [Testing Guide](./apps/flight/tests/TESTING.md) |
| **Booking Service**      | `@airline/booking`       | `3003` | Seat reservations, booking lifecycles, and transaction processing   | Active                 | [`apps/booking`](./apps/booking)                                                                                                                |
| **Notification Service** | `@airline/notifications` | `3004` | Asynchronous email dispatch and scheduled ticket tasks via RabbitMQ | Active                 | [`apps/notifications`](./apps/notifications)                                                                                                    |

---

## Standard Response Envelope

All microservices across the platform adhere to a uniform JSON response contract. This shared envelope simplifies client-side consumption, API Gateway proxying, and error monitoring across the system.

### Success Response (`HTTP 200 / 201`)

```json
{
    "success": true,
    "message": "Human-readable summary of the successful operation",
    "data": { ... },
    "error": {}
}
```

### Error Response (`HTTP 400 / 401 / 403 / 404 / 409 / 500`)

```json
{
  "success": false,
  "message": "Human-readable summary of the failure",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "Field-level or system-level error explanation"
  }
}
```

---

## Service Highlight: Auth Microservice (`@airline/auth`)

The **Auth Service** is the central security and identity provider for the platform. It provides token-based authentication and role-based access control for protected endpoints across all downstream microservices.

### Highlights

- **Layered Clean Architecture:** Routes $\rightarrow$ Middlewares $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ Models.
- **Decoupled Server Entrypoint:** Express setup (`src/app.js`) is decoupled from the network listener (`src/index.js`), enabling fast in-memory integration testing via Supertest without socket conflicts.
- **Input Validation via Zod:** Automatic payload validation, type coercion, whitespace trimming, and email normalization.
- **Transactional Consistency:** User creation and role assignment are wrapped in database transactions with automated rollback on error.
- **Enterprise Test Suite:** 14 test suites and 99 automated tests passing with 99.64% line coverage.

_For complete architecture breakdown, database schema, and endpoint documentation, refer to the [**Auth Service README**](./apps/auth/README.md)._

---

## Service Highlight: Flight Microservice (`@airline/flight`)

The **Flight Service** is the central flight inventory and route scheduling backbone of the platform. It provides high-performance flight querying, fleet management, airport/city mapping, and high-concurrency seat inventory management.

### Highlights

- **Layered Clean Architecture:** Routes $\rightarrow$ Middlewares $\rightarrow$ Controllers $\rightarrow$ Services $\rightarrow$ Repositories $\rightarrow$ Models.
- **Pessimistic Row Locking (`SELECT ... FOR UPDATE`):** Guarantees zero overselling race conditions during concurrent seat reservations within database transactions.
- **Multi-Factor Search & Query Engine:** Filters flights across origin-destination pairs (`trips`), pricing windows, available seat counts (`travellers`), specific dates (`tripDate`), and multi-column sorting.
- **Defensive Domain Integrity:** Automated validation preventing overlapping flight schedules for the same aircraft, identical departure/arrival airports, chronological time violations, and unsafe capacity reductions.
- **Enterprise Test Suite:** 27 test suites and 239 automated tests passing with 94.75% line coverage.

_For complete architecture breakdown, database schema, and endpoint documentation, refer to the [**Flight Service README**](./apps/flight/README.md), [**Flight API Documentation**](./apps/flight/API_DOCUMENTATION.md), and [**Flight Testing Guide**](./apps/flight/tests/TESTING.md)._

---

## Testing Strategy & Quality Overview

The monorepo enforces a **Testing Pyramid** approach to balance test fidelity and execution speed:

```text
       /\
      /  \       Integration Tests (Supertest)
     /----\      - Tests HTTP routes, status codes, and middleware chains
    /      \     - Uses decoupled Express app without binding network ports
   /--------\
  /   Unit   \   Unit Tests (Jest)
 /   Tests    \  - Fast, isolated tests with mocked dependencies
/______________\ - Services, repositories, schemas, models, and utilities
```

- **Speed & Determinism:** Unit tests isolate external dependencies (databases, bcrypt, external APIs) using Jest mocks, allowing the entire suite to run in seconds.
- **Continuous Gate:** The pre-commit pipeline automatically identifies and executes only the tests related to changed files before commits are accepted.
- **Detailed Specifications:** Service-specific test scenarios, edge-case matrices, and mocking guidelines reside directly within each service's testing documentation (e.g. [**Auth Testing Guide**](./apps/auth/tests/TESTING.md)).

---

## Developer Tooling & Pre-commit Pipeline

A standard developer workflow is enforced across the monorepo to ensure clean, consistent, and error-free code:

### Tooling Stack

- **Husky (v9):** Lightweight Git hook orchestrator.
- **lint-staged:** Executes checks strictly against **staged files** for sub-second execution.
- **ESLint (v9 Flat Config):** Enforces good programming practices, including immutability (`prefer-const`, `no-var`), strict equality (`eqeqeq`), async/promise safety, and dead code prevention.
- **Prettier:** Automatic code formatting (single quotes, 4 spaces tab width, semicolons, auto line-endings).

### Pre-commit Workflow

When `git commit` is executed, the following pipeline runs automatically:

```text
Staged Files (git add)
       │
       ▼
npx lint-staged (via .husky/pre-commit)
       ├── 1. eslint --fix                     (Enforces standards & auto-fixes issues)
       ├── 2. prettier --write                 (Formats code style and spacing)
       └── 3. jest --findRelatedTests --bail   (Runs ONLY the tests covering modified files)
       │
       ▼
Pass -> Commit succeeds | Fail -> Commit is blocked with actionable error message
```

---

## Getting Started

### Prerequisites

- **Node.js:** `>= 18.x` (Recommended: Node 20 or 22)
- **npm:** `>= 9.x`
- **MySQL:** Running on port `3306`
- **RabbitMQ:** Running on port `5672` (for Notifications)

### 1. Installation

Install all root and workspace dependencies with a single command from the root directory:

```bash
git clone https://github.com/amShubhama/airline-microservices-backend.git
cd airline-microservices-backend
npm install
```

_(Running `npm install` automatically initializes Husky Git hooks via the `prepare` script.)_

### 2. Environment Configuration

Each service contains an `.env` file for configuration. Example for `apps/auth/.env`:

```env
PORT=3001
JWT_KEY=your_jwt_secret_key
JWT_EXPIRY=1d
```

Database connection settings are configured in each service's `src/config/config.json`.

### 3. Database Migrations & Seeds

Run migrations and seeds for individual services:

```bash
cd apps/auth
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
cd ../..
```

---

## Running the Services

### Start All Services Concurrently (Gateway + Microservices)

```bash
npm run dev
```

### Start Individual Services

```bash
npm run dev:gateway        # API Gateway (:3000)
npm run dev:auth           # Auth Service (:3001)
npm run dev:flight         # Flight Service (:3002)
npm run dev:booking        # Booking Service (:3003)
npm run dev:notifications  # Notification Service (:3004)
```

---

## Testing & Quality Commands

```bash
# Run all test suites across the monorepo
npm test

# Run tests in watch mode
npm run test:watch -w @airline/auth

# Run test coverage report
npm run test:coverage -w @airline/auth

# Linting and auto-fixing
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check
```

---

## Monorepo Structure

```text
AirlineManagement/
├── .husky/                                 # Git hook definitions (pre-commit)
├── .lintstagedrc.json                      # Staged files linter & test runner config
├── .prettierrc.json                        # Prettier code formatting rules
├── .prettierignore                         # Prettier ignore list
├── eslint.config.js                        # ESLint 9 Flat Config (monorepo-wide)
├── jest.config.js                          # Root Jest monorepo orchestrator config
├── package.json                            # Root npm workspaces configuration
├── README.md                               # Root architecture & project documentation
│
└── apps/
    ├── api-gateway/                        # Reverse proxy & request router (:3000)
    │
    ├── auth/                               # Authentication & Identity Service (:3001)
    │   ├── API_DOCUMENTATION.md            # Auth REST API contract & endpoints
    │   ├── README.md                       # Auth service architecture & setup
    │   ├── jest.config.js                  # Auth-specific Jest configuration
    │   ├── package.json                    # Auth dependencies & test scripts
    │   ├── src/                            # Application source code
    │   └── tests/                          # Automated test suites & TESTING.md
    │
    ├── booking/                            # Booking & Reservation Service (:3003)
    │
    ├── flight/                             # Flight & Inventory Service (:3002)
    │   ├── API_DOCUMENTATION.md            # Flight REST API contract & endpoints
    │   ├── README.md                       # Flight service architecture & setup
    │   ├── jest.config.js                  # Flight-specific Jest configuration
    │   ├── package.json                    # Flight dependencies & test scripts
    │   ├── src/                            # Application source code
    │   └── tests/                          # Automated test suites & TESTING.md
    │
    └── notifications/                      # Message consumer & Email Service (:3004)
```

---

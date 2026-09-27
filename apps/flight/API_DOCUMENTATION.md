# Flight Service API Documentation

The **Flight Service** manages aircraft fleets, flight schedules, airports, city hubs, seat layouts, and real-time seat inventories across the Airline Management microservices system. It provides high-concurrency seat reservation updates using database-level pessimistic locking (`SELECT ... FOR UPDATE`) to guarantee ACID transaction integrity during high-throughput booking traffic.

- **Base URL:** `http://localhost:3002/api/v1` (or via Gateway: `http://localhost:3000/api/v1/flights`, `/airplanes`, `/airports`, `/cities`, `/seats`)
- **Protocol:** HTTP/1.1 REST
- **Response Format:** JSON (`application/json`)
- **Primary Key Format:** Auto-incrementing Integer (`id`) | 3-letter IATA string (`code` for airports)
- **Role-Based Access Control:** Administrative write operations require the `x-user-role: ADMIN` header (propagated downstream by the API Gateway following token verification).

---

## Standardized Response Envelope

All API endpoints return a uniform response envelope conforming to monorepo-wide conventions.

### Success Response Envelope (`HTTP 200 / 201`)

```json
{
  "success": true,
  "message": "Human-readable explanation of successful operation",
  "data": { ... },
  "error": {}
}
```

### Error Response Envelope (`HTTP 400 / 403 / 404 / 409 / 500`)

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

## Authentication & Role Verification

Administrative mutations (`POST`, `PATCH`, `DELETE` on protected resources) are guarded by `requireAdmin` middleware.

| Header        | Expected Value | Required By                  | Description                                        |
| :------------ | :------------- | :--------------------------- | :------------------------------------------------- |
| `x-user-role` | `ADMIN`        | All Admin Mutation Endpoints | Role identity verified and injected by API Gateway |

When `x-user-role` is missing or not equal to `ADMIN`, the service terminates the request with `403 Forbidden`:

```json
{
  "success": false,
  "message": "Forbidden. Admin privileges are required to perform this action.",
  "data": {},
  "error": {
    "statusCode": 403,
    "explanation": "Forbidden. Admin privileges are required to perform this action."
  }
}
```

---

## Endpoints Index

- [Health Check](#1-health-check)
- [Flight Endpoints](#flight-endpoints)
  - [Search & Query Flights](#2-search-query-flights)
  - [Get Flight by ID](#3-get-flight-by-id)
  - [Schedule New Flight](#4-schedule-new-flight)
  - [Update Flight Details](#5-update-flight-details)
  - [Delete / Cancel Flight](#6-delete-cancel-flight)
  - [Update Seat Inventory (Reserve / Release)](#7-update-seat-inventory-reserve-release)
- [Airplane Endpoints](#airplane-endpoints)
  - [List All Airplanes](#8-list-all-airplanes)
  - [Get Airplane by ID](#9-get-airplane-by-id)
  - [Create Airplane](#10-create-airplane)
  - [Update Airplane](#11-update-airplane)
  - [Delete Airplane](#12-delete-airplane)
- [Airport Endpoints](#airport-endpoints)
  - [List All Airports](#13-list-all-airports)
  - [Get Airport by ID](#14-get-airport-by-id)
  - [Get Airport by IATA Code](#15-get-airport-by-iata-code)
  - [Create Airport](#16-create-airport)
  - [Update Airport](#17-update-airport)
  - [Delete Airport](#18-delete-airport)
- [City Endpoints](#city-endpoints)
  - [List All Cities](#19-list-all-cities)
  - [Get City by ID](#20-get-city-by-id)
  - [Create City](#21-create-city)
  - [Update City](#22-update-city)
  - [Delete City](#23-delete-city)
- [Seat Endpoints](#seat-endpoints)
  - [Get Seats by Airplane](#24-get-seats-by-airplane)
  - [Create Single Seat](#25-create-single-seat)
  - [Bulk Generate Seats](#26-bulk-generate-seats)

---

## Health Check

### 1. Health Check

Verifies service liveness and runtime operational readiness.

- **URL:** `/health`
- **Method:** `GET`
- **Auth Required:** No

#### Response: `200 OK`

```json
{
  "status": "healthy",
  "service": "Flight Service",
  "timestamp": "2026-09-27T12:00:00.000Z"
}
```

---

## Flight Endpoints

### 2. Search & Query Flights

Retrieves a paginated list of scheduled flights filtered by route, date, price, available seats, and status, with dynamic ordering. Eager-loads airplane and airport details.

- **URL:** `/flights`
- **Method:** `GET`
- **Auth Required:** No

#### Query Parameters

| Parameter              | Type     | Format / Allowed Values           | Description                                                                      |
| :--------------------- | :------- | :-------------------------------- | :------------------------------------------------------------------------------- |
| `trips`                | `string` | `XXX-YYY` (e.g. `DEL-BOM`)        | Origin-Destination 3-letter IATA pair                                            |
| `departureAirportCode` | `string` | 3 alphabetic letters (e.g. `DEL`) | Filter specifically by departure airport                                         |
| `arrivalAirportCode`   | `string` | 3 alphabetic letters (e.g. `BOM`) | Filter specifically by arrival airport                                           |
| `price`                | `string` | `min-max` (e.g. `2500-7500`)      | Price range boundary                                                             |
| `minPrice`             | `number` | Positive number                   | Minimum flight price boundary                                                    |
| `maxPrice`             | `number` | Positive number                   | Maximum flight price boundary                                                    |
| `travellers`           | `number` | Integer (`1` to `9`)              | Filters flights with `remainingSeats >= travellers`                              |
| `tripDate`             | `string` | `YYYY-MM-DD`                      | Filters departure dates within specified day `[00:00:00 - 23:59:59]`             |
| `status`               | `string` | `scheduled`, `on-time`, etc.      | Filter status. Defaults to active flights (`scheduled`, `on-time`, `delayed`)    |
| `sort`                 | `string` | `field_asc` or `field_desc`       | Allowed: `price`, `departureTime`, `arrivalTime`, `remainingSeats`, `totalSeats` |
| `limit`                | `number` | Integer (`1` to `100`, def: `20`) | Pagination record limit                                                          |
| `offset`               | `number` | Integer (`>= 0`, def: `0`)        | Pagination offset                                                                |

##### Example Request:

```http
GET /api/v1/flights?trips=DEL-BOM&tripDate=2026-10-15&travellers=2&sort=price_asc&limit=10 HTTP/1.1
```

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched all flights",
  "data": [
    {
      "id": 101,
      "flightNumber": "AI-202",
      "airplaneId": 1,
      "departureAirportCode": "DEL",
      "arrivalAirportCode": "BOM",
      "departureTime": "2026-10-15T08:30:00.000Z",
      "arrivalTime": "2026-10-15T10:45:00.000Z",
      "price": 4500,
      "boardingGate": "B4",
      "totalSeats": 180,
      "remainingSeats": 142,
      "status": "scheduled",
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z",
      "airplaneDetail": {
        "id": 1,
        "modelNumber": "Airbus A320",
        "capacity": 180
      },
      "departureAirport": {
        "id": 1,
        "name": "Indira Gandhi International Airport",
        "code": "DEL",
        "address": "New Delhi, Delhi",
        "city": { "id": 1, "name": "Delhi" }
      },
      "arrivalAirport": {
        "id": 2,
        "name": "Chhatrapati Shivaji Maharaj International Airport",
        "code": "BOM",
        "address": "Mumbai, Maharashtra",
        "city": { "id": 2, "name": "Mumbai" }
      }
    }
  ],
  "error": {}
}
```

##### `400 Bad Request` (Invalid Search Parameters)

```json
{
  "success": false,
  "message": "Validation failed for request data",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": ["query.trips: Origin and destination airports in trips cannot be identical"]
  }
}
```

---

### 3. Get Flight by ID

Fetches full flight details including airplane specifications, departure airport, arrival airport, and corresponding host cities.

- **URL:** `/flights/:id`
- **Method:** `GET`
- **Auth Required:** No

#### Request Parameters

| Parameter | Type      | Validation Rules | Description             |
| :-------- | :-------- | :--------------- | :---------------------- |
| `id`      | `integer` | Positive integer | Unique Flight record ID |

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched flight details",
  "data": {
    "id": 101,
    "flightNumber": "AI-202",
    "airplaneId": 1,
    "departureAirportCode": "DEL",
    "arrivalAirportCode": "BOM",
    "departureTime": "2026-10-15T08:30:00.000Z",
    "arrivalTime": "2026-10-15T10:45:00.000Z",
    "price": 4500,
    "boardingGate": "B4",
    "totalSeats": 180,
    "remainingSeats": 142,
    "status": "scheduled",
    "airplaneDetail": {
      "id": 1,
      "modelNumber": "Airbus A320",
      "capacity": 180
    },
    "departureAirport": {
      "id": 1,
      "name": "Indira Gandhi International Airport",
      "code": "DEL",
      "city": { "id": 1, "name": "Delhi" }
    },
    "arrivalAirport": {
      "id": 2,
      "name": "Chhatrapati Shivaji Maharaj International Airport",
      "code": "BOM",
      "city": { "id": 2, "name": "Mumbai" }
    }
  },
  "error": {}
}
```

##### `404 Not Found`

```json
{
  "success": false,
  "message": "The requested flight was not found",
  "data": {},
  "error": {
    "statusCode": 404,
    "explanation": "The requested flight was not found"
  }
}
```

---

### 4. Schedule New Flight

Schedules a new flight after validating airport existence, chronological departure/arrival times, aircraft capacity constraints, and detecting scheduling conflicts for the airplane.

- **URL:** `/flights`
- **Method:** `POST`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Request Body

| Field                  | Type      | Validation Rules                                               | Description                               |
| :--------------------- | :-------- | :------------------------------------------------------------- | :---------------------------------------- |
| `flightNumber`         | `string`  | Required, 3–10 chars, IATA standard (e.g. `AI-202`, `6E-501`)  | Unique identifier of the scheduled flight |
| `airplaneId`           | `integer` | Required, positive integer, must exist in DB                   | Aircraft assigned to the flight           |
| `departureAirportCode` | `string`  | Required, exactly 3 letters (e.g. `DEL`), must exist in DB     | Origin airport IATA code                  |
| `arrivalAirportCode`   | `string`  | Required, exactly 3 letters, must differ from departure        | Destination airport IATA code             |
| `departureTime`        | `string`  | Required, valid ISO date-time string                           | Flight scheduled departure                |
| `arrivalTime`          | `string`  | Required, valid ISO date-time string, strictly > departure     | Flight scheduled arrival                  |
| `price`                | `integer` | Required, integer >= `100`                                     | Base ticket price                         |
| `boardingGate`         | `string`  | Optional, max 20 characters                                    | Boarding gate terminal identifier         |
| `totalSeats`           | `integer` | Optional, <= airplane capacity (defaults to airplane capacity) | Seat allotment for the flight             |
| `remainingSeats`       | `integer` | Optional, defaults to `totalSeats`                             | Initial bookable seat inventory           |
| `status`               | `string`  | Optional, enum (`scheduled`, `on-time`, `delayed`, etc.)       | Initial status (default: `scheduled`)     |

##### Example Request:

```json
{
  "flightNumber": "UK-820",
  "airplaneId": 2,
  "departureAirportCode": "BOM",
  "arrivalAirportCode": "BLR",
  "departureTime": "2026-11-01T06:00:00.000Z",
  "arrivalTime": "2026-11-01T07:45:00.000Z",
  "price": 3800,
  "boardingGate": "A2",
  "status": "scheduled"
}
```

#### Responses

##### `201 Created`

```json
{
  "success": true,
  "message": "Successfully scheduled the flight",
  "data": {
    "id": 105,
    "flightNumber": "UK-820",
    "airplaneId": 2,
    "departureAirportCode": "BOM",
    "arrivalAirportCode": "BLR",
    "departureTime": "2026-11-01T06:00:00.000Z",
    "arrivalTime": "2026-11-01T07:45:00.000Z",
    "price": 3800,
    "boardingGate": "A2",
    "totalSeats": 160,
    "remainingSeats": 160,
    "status": "scheduled",
    "createdAt": "2026-09-27T12:00:00.000Z",
    "updatedAt": "2026-09-27T12:00:00.000Z"
  },
  "error": {}
}
```

##### `400 Bad Request` (Chronological Time Conflict or Overlapping Schedule)

```json
{
  "success": false,
  "message": "Airplane is already scheduled on another flight during this timeframe",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "Airplane with id 2 is already scheduled on flight '6E-340' during this timeframe"
  }
}
```

---

### 5. Update Flight Details

Updates existing flight attributes. Validates that updated timings do not create scheduling overlaps for the aircraft and do not violate chronological constraints.

- **URL:** `/flights/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Request Body

At least one valid field must be provided:

| Field                  | Type      | Validation Rules                              | Description               |
| :--------------------- | :-------- | :-------------------------------------------- | :------------------------ |
| `flightNumber`         | `string`  | Optional, 3–10 chars                          | Updated flight number     |
| `airplaneId`           | `integer` | Optional, positive integer                    | Reassigned airplane ID    |
| `departureAirportCode` | `string`  | Optional, 3 letters                           | Updated departure airport |
| `arrivalAirportCode`   | `string`  | Optional, 3 letters                           | Updated arrival airport   |
| `departureTime`        | `string`  | Optional, valid ISO date-time string          | Updated departure time    |
| `arrivalTime`          | `string`  | Optional, valid ISO date-time string          | Updated arrival time      |
| `price`                | `integer` | Optional, integer >= `100`                    | Updated ticket price      |
| `boardingGate`         | `string`  | Optional, max 20 chars                        | Updated boarding gate     |
| `status`               | `string`  | Optional, enum (`scheduled`, `delayed`, etc.) | Updated flight status     |

##### Example Request:

```json
{
  "boardingGate": "C12",
  "status": "delayed",
  "departureTime": "2026-11-01T07:00:00.000Z",
  "arrivalTime": "2026-11-01T08:45:00.000Z"
}
```

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully updated the flight",
  "data": {
    "id": 105,
    "flightNumber": "UK-820",
    "boardingGate": "C12",
    "status": "delayed",
    "departureTime": "2026-11-01T07:00:00.000Z",
    "arrivalTime": "2026-11-01T08:45:00.000Z"
  },
  "error": {}
}
```

---

### 6. Delete / Cancel Flight

Cancels and deletes a flight record.

- **URL:** `/flights/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully cancelled the flight",
  "data": true,
  "error": {}
}
```

---

### 7. Update Seat Inventory (Reserve / Release)

Performs high-concurrency inventory adjustments when bookings are created or cancelled. Employs row-level pessimistic locking (`SELECT ... FOR UPDATE`) within an ACID transaction to prevent overselling race conditions under concurrent requests.

- **URL:** `/flights/:id/seats`
- **Method:** `PATCH`
- **Auth Required:** No (Internal / Microservice Inter-call)

#### Request Body

| Field   | Type                  | Validation Rules             | Description                                                                              |
| :------ | :-------------------- | :--------------------------- | :--------------------------------------------------------------------------------------- |
| `seats` | `integer`             | Required, integer `1` to `9` | Number of seats to deduct or restore                                                     |
| `dec`   | `boolean` / `1` / `0` | Optional, defaults to `true` | `true`: Decrement remaining seats (reserve)<br>`false`: Increment seats (cancel/release) |

##### Example Request (Reserve 2 seats):

```json
{
  "seats": 2,
  "dec": true
}
```

##### Example Request (Release 2 seats upon cancellation):

```json
{
  "seats": 2,
  "dec": false
}
```

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully updated flight seat availability",
  "data": {
    "id": 105,
    "flightNumber": "UK-820",
    "totalSeats": 160,
    "remainingSeats": 158,
    "updatedAt": "2026-09-27T12:05:00.000Z"
  },
  "error": {}
}
```

##### `400 Bad Request` (Insufficient Seat Availability)

```json
{
  "success": false,
  "message": "Not enough seats available on this flight",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "Not enough seats available on this flight"
  }
}
```

##### `400 Bad Request` (Flight Departed or Cancelled)

```json
{
  "success": false,
  "message": "Cannot modify seats on a departed or completed flight",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "Flight has already departed"
  }
}
```

---

## Airplane Endpoints

### 8. List All Airplanes

Returns all airplanes ordered alphabetically by model number.

- **URL:** `/airplanes`
- **Method:** `GET`
- **Auth Required:** No

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched all airplanes",
  "data": [
    {
      "id": 1,
      "modelNumber": "Airbus A320",
      "capacity": 180,
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z"
    },
    {
      "id": 2,
      "modelNumber": "Boeing 737",
      "capacity": 160,
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z"
    }
  ],
  "error": {}
}
```

---

### 9. Get Airplane by ID

- **URL:** `/airplanes/:id`
- **Method:** `GET`
- **Auth Required:** No

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched airplane details",
  "data": {
    "id": 1,
    "modelNumber": "Airbus A320",
    "capacity": 180,
    "createdAt": "2026-09-26T10:00:00.000Z",
    "updatedAt": "2026-09-26T10:00:00.000Z"
  },
  "error": {}
}
```

---

### 10. Create Airplane

Registers a new airplane model and passenger capacity.

- **URL:** `/airplanes`
- **Method:** `POST`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Request Body

| Field         | Type      | Validation Rules                   | Description                  |
| :------------ | :-------- | :--------------------------------- | :--------------------------- |
| `modelNumber` | `string`  | Required, trimmed, 2–50 characters | Unique model designation     |
| `capacity`    | `integer` | Required, integer `1` to `1000`    | Maximum passenger seat limit |

##### Example Request:

```json
{
  "modelNumber": "Boeing 777-300ER",
  "capacity": 350
}
```

#### Responses

##### `201 Created`

```json
{
  "success": true,
  "message": "Successfully created the airplane",
  "data": {
    "id": 3,
    "modelNumber": "Boeing 777-300ER",
    "capacity": 350,
    "createdAt": "2026-09-27T12:00:00.000Z",
    "updatedAt": "2026-09-27T12:00:00.000Z"
  },
  "error": {}
}
```

---

### 11. Update Airplane

Updates airplane model or capacity. Defensively prevents reducing capacity below configured physical seats or existing flight ticket reservations.

- **URL:** `/airplanes/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Request Body

| Field         | Type      | Validation Rules                | Description               |
| :------------ | :-------- | :------------------------------ | :------------------------ |
| `modelNumber` | `string`  | Optional, 2–50 characters       | Updated model designation |
| `capacity`    | `integer` | Optional, integer `1` to `1000` | Updated capacity limit    |

##### Example Request:

```json
{
  "capacity": 360
}
```

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully updated the airplane",
  "data": {
    "id": 3,
    "modelNumber": "Boeing 777-300ER",
    "capacity": 360
  },
  "error": {}
}
```

##### `400 Bad Request` (Capacity Reduction Violation)

```json
{
  "success": false,
  "message": "Cannot reduce airplane capacity below configured seat count",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "Cannot reduce capacity to 100. Airplane currently has 160 physical seats configured."
  }
}
```

---

### 12. Delete Airplane

Deletes an airplane record. Rejects deletion if the airplane is actively assigned to scheduled or existing flights (`RESTRICT` foreign key protection).

- **URL:** `/airplanes/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully deleted the airplane",
  "data": true,
  "error": {}
}
```

##### `400 Bad Request` (Referenced in Active Flights)

```json
{
  "success": false,
  "message": "Cannot delete airplane with scheduled or existing flights",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "Airplane 'Airbus A320' (id: 1) cannot be deleted because it is assigned to existing flights"
  }
}
```

---

## Airport Endpoints

### 13. List All Airports

Returns all registered airports sorted alphabetically by IATA code. Eager-loads associated host city details.

- **URL:** `/airports`
- **Method:** `GET`
- **Auth Required:** No

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched all airports",
  "data": [
    {
      "id": 2,
      "name": "Chhatrapati Shivaji Maharaj International Airport",
      "code": "BOM",
      "address": "Mumbai, Maharashtra",
      "cityId": 2,
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z"
    },
    {
      "id": 1,
      "name": "Indira Gandhi International Airport",
      "code": "DEL",
      "address": "New Delhi, Delhi",
      "cityId": 1,
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z"
    }
  ],
  "error": {}
}
```

---

### 14. Get Airport by ID

- **URL:** `/airports/:id`
- **Method:** `GET`
- **Auth Required:** No

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched airport details",
  "data": {
    "id": 1,
    "name": "Indira Gandhi International Airport",
    "code": "DEL",
    "address": "New Delhi, Delhi",
    "cityId": 1
  },
  "error": {}
}
```

---

### 15. Get Airport by IATA Code

Retrieves airport specifications by its unique 3-letter IATA identifier.

- **URL:** `/airports/code/:code`
- **Method:** `GET`
- **Auth Required:** No

##### Example Request:

```http
GET /api/v1/airports/code/DEL HTTP/1.1
```

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched airport details",
  "data": {
    "id": 1,
    "name": "Indira Gandhi International Airport",
    "code": "DEL",
    "address": "New Delhi, Delhi",
    "cityId": 1
  },
  "error": {}
}
```

---

### 16. Create Airport

Creates an airport mapped to a valid parent city.

- **URL:** `/airports`
- **Method:** `POST`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Request Body

| Field     | Type      | Validation Rules                                             | Description                     |
| :-------- | :-------- | :----------------------------------------------------------- | :------------------------------ |
| `name`    | `string`  | Required, trimmed, 3–150 characters, unique                  | Official name of the airport    |
| `code`    | `string`  | Required, 3 letters, auto-uppercased, unique                 | IATA 3-letter uppercase code    |
| `cityId`  | `integer` | Required, positive integer, must correspond to existing City | Parent city record ID           |
| `address` | `string`  | Optional, max 255 characters                                 | Physical location / street info |

##### Example Request:

```json
{
  "name": "Kempegowda International Airport",
  "code": "BLR",
  "cityId": 3,
  "address": "Devanahalli, Bengaluru, Karnataka 560300"
}
```

#### Responses

##### `201 Created`

```json
{
  "success": true,
  "message": "Successfully created the airport",
  "data": {
    "id": 3,
    "name": "Kempegowda International Airport",
    "code": "BLR",
    "cityId": 3,
    "address": "Devanahalli, Bengaluru, Karnataka 560300",
    "createdAt": "2026-09-27T12:00:00.000Z",
    "updatedAt": "2026-09-27T12:00:00.000Z"
  },
  "error": {}
}
```

##### `409 Conflict` (Duplicate Code or Name)

```json
{
  "success": false,
  "message": "Airport with this code or name already exists",
  "data": {},
  "error": {
    "statusCode": 409,
    "explanation": ["code must be unique"]
  }
}
```

---

### 17. Update Airport

- **URL:** `/airports/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully updated the airport",
  "data": {
    "id": 3,
    "name": "Kempegowda International Airport Terminal 2",
    "code": "BLR",
    "cityId": 3
  },
  "error": {}
}
```

---

### 18. Delete Airport

Deletes an airport. Rejects deletion if flights are scheduled with this airport as origin or destination (`RESTRICT` foreign key rule).

- **URL:** `/airports/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully deleted the airport",
  "data": true,
  "error": {}
}
```

##### `400 Bad Request` (Referenced by Scheduled Flights)

```json
{
  "success": false,
  "message": "Cannot delete airport with scheduled flights",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "Airport 'DEL' cannot be deleted because it is referenced by existing or scheduled flights"
  }
}
```

---

## City Endpoints

### 19. List All Cities

Returns all cities alphabetically by name.

- **URL:** `/cities`
- **Method:** `GET`
- **Auth Required:** No

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched all cities",
  "data": [
    {
      "id": 3,
      "name": "Bengaluru",
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z"
    },
    {
      "id": 1,
      "name": "Delhi",
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Mumbai",
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z"
    }
  ],
  "error": {}
}
```

---

### 20. Get City by ID

Fetches city record along with all associated airport hubs.

- **URL:** `/cities/:id`
- **Method:** `GET`
- **Auth Required:** No

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched city details",
  "data": {
    "id": 1,
    "name": "Delhi",
    "airports": [
      {
        "id": 1,
        "name": "Indira Gandhi International Airport",
        "code": "DEL",
        "address": "New Delhi, Delhi"
      }
    ]
  },
  "error": {}
}
```

---

### 21. Create City

- **URL:** `/cities`
- **Method:** `POST`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Request Body

| Field  | Type     | Validation Rules                                            | Description              |
| :----- | :------- | :---------------------------------------------------------- | :----------------------- |
| `name` | `string` | Required, trimmed, 2–100 chars, letters/spaces/hyphens only | Name of the municipality |

##### Example Request:

```json
{
  "name": "Hyderabad"
}
```

#### Response: `201 Created`

```json
{
  "success": true,
  "message": "Successfully created the city",
  "data": {
    "id": 4,
    "name": "Hyderabad",
    "createdAt": "2026-09-27T12:00:00.000Z",
    "updatedAt": "2026-09-27T12:00:00.000Z"
  },
  "error": {}
}
```

---

### 22. Update City

- **URL:** `/cities/:id`
- **Method:** `PATCH`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Successfully updated the city",
  "data": {
    "id": 4,
    "name": "Secunderabad"
  },
  "error": {}
}
```

---

### 23. Delete City

Deletes city record. Blocked if airports are currently associated with the city.

- **URL:** `/cities/:id`
- **Method:** `DELETE`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Responses

##### `200 OK`

```json
{
  "success": true,
  "message": "Successfully deleted the city",
  "data": true,
  "error": {}
}
```

##### `400 Bad Request` (Airports Attached)

```json
{
  "success": false,
  "message": "Cannot delete city with registered airports",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "City 'Delhi' cannot be deleted because it has 1 registered airport(s). Delete or reassign airports first."
  }
}
```

---

## Seat Endpoints

### 24. Get Seats by Airplane

Retrieves all physical seat records configured for an aircraft. Can be invoked either via path parameter `/seats/airplanes/:airplaneId` or query parameter `/seats?airplaneId=:airplaneId`.

- **URL:** `/seats/airplanes/:airplaneId` OR `/seats?airplaneId=:id`
- **Method:** `GET`
- **Auth Required:** No

#### Response: `200 OK`

```json
{
  "success": true,
  "message": "Successfully fetched seats for the airplane",
  "data": [
    {
      "id": 1,
      "airplaneId": 1,
      "row": 1,
      "col": "A",
      "type": "business",
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z"
    },
    {
      "id": 2,
      "airplaneId": 1,
      "row": 1,
      "col": "B",
      "type": "business",
      "createdAt": "2026-09-26T10:00:00.000Z",
      "updatedAt": "2026-09-26T10:00:00.000Z"
    }
  ],
  "error": {}
}
```

---

### 25. Create Single Seat

Configures a single seat coordinate for an aircraft. Validates that the coordinate `(airplaneId, row, col)` is unique and does not exceed the airplane's total passenger capacity.

- **URL:** `/seats`
- **Method:** `POST`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Request Body

| Field        | Type      | Validation Rules                                                         | Description                 |
| :----------- | :-------- | :----------------------------------------------------------------------- | :-------------------------- |
| `airplaneId` | `integer` | Required, positive integer, must exist in DB                             | Target airplane ID          |
| `row`        | `integer` | Required, integer `1` to `100`                                           | Cabin row index             |
| `col`        | `string`  | Required, single letter `A` to `K`, auto-uppercased                      | Cabin column index          |
| `type`       | `string`  | Optional, enum (`business`, `economy`, `premium-economy`, `first-class`) | Seat class (def: `economy`) |

##### Example Request:

```json
{
  "airplaneId": 1,
  "row": 12,
  "col": "F",
  "type": "economy"
}
```

#### Responses

##### `201 Created`

```json
{
  "success": true,
  "message": "Successfully created the seat",
  "data": {
    "id": 25,
    "airplaneId": 1,
    "row": 12,
    "col": "F",
    "type": "economy",
    "createdAt": "2026-09-27T12:00:00.000Z",
    "updatedAt": "2026-09-27T12:00:00.000Z"
  },
  "error": {}
}
```

##### `409 Conflict` (Seat Coordinate Occupied)

```json
{
  "success": false,
  "message": "Seat already exists at this row and column for the aircraft",
  "data": {},
  "error": {
    "statusCode": 409,
    "explanation": "Seat at Row 12 Col F already exists for this aircraft"
  }
}
```

---

### 26. Bulk Generate Seats

Generates multiple seat records in bulk for an airplane in a single transaction. Validates total seat counts against the aircraft's rated capacity and gracefully ignores duplicates.

- **URL:** `/seats/airplanes/:airplaneId/batch`
- **Method:** `POST`
- **Auth Required:** Yes (`x-user-role: ADMIN`)

#### Request Parameters

| Parameter    | Type      | Validation Rules | Description        |
| :----------- | :-------- | :--------------- | :----------------- |
| `airplaneId` | `integer` | Positive integer | Target airplane ID |

#### Request Body

| Field   | Type            | Validation Rules                                                          | Description                           |
| :------ | :-------------- | :------------------------------------------------------------------------ | :------------------------------------ |
| `seats` | `array[object]` | Required, non-empty array of `{ row: int, col: string(1), type: string }` | List of seat specifications to create |

##### Example Request:

```json
{
  "seats": [
    { "row": 1, "col": "A", "type": "business" },
    { "row": 1, "col": "B", "type": "business" },
    { "row": 2, "col": "A", "type": "economy" },
    { "row": 2, "col": "B", "type": "economy" }
  ]
}
```

#### Responses

##### `201 Created`

```json
{
  "success": true,
  "message": "Successfully created seats for the airplane",
  "data": [
    { "id": 50, "airplaneId": 2, "row": 1, "col": "A", "type": "business" },
    { "id": 51, "airplaneId": 2, "row": 1, "col": "B", "type": "business" },
    { "id": 52, "airplaneId": 2, "row": 2, "col": "A", "type": "economy" },
    { "id": 53, "airplaneId": 2, "row": 2, "col": "B", "type": "economy" }
  ],
  "error": {}
}
```

##### `400 Bad Request` (Exceeds Aircraft Capacity)

```json
{
  "success": false,
  "message": "Total seats exceed airplane capacity",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": "Cannot generate 50 seats. Aircraft capacity is 160, currently has 140 seats (20 remaining slots)"
  }
}
```

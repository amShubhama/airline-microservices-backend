# 🔐 Auth Service API Documentation

The **Auth Service** manages user identity, credentials, registration, role assignments, and JSON Web Token (JWT) issuance and validation across the Airline Management microservices system.

- **Base URL:** `http://localhost:3001/api/v1` (or via Gateway: `http://localhost:3000/api/v1/auth`)
- **Protocol:** HTTP/1.1 REST
- **Response Format:** JSON (`application/json`)
- **Primary Key Format:** UUID v4

---

## 📐 Standardized Response Envelope

All API endpoints return a uniform response envelope.

### Success Response Envelope (`HTTP 200 / 201`)
```json
{
  "success": true,
  "message": "Human-readable explanation of successful operation",
  "data": { ... },
  "error": {}
}
```

### Error Response Envelope (`HTTP 400 / 401 / 403 / 404 / 409 / 500`)
```json
{
  "success": false,
  "message": "Human-readable summary of the failure",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": [
      "Field-level or system-level error explanation"
    ]
  }
}
```

---

## 🚪 Endpoints Reference

### 1. Register User (Sign Up)

Registers a new user account, validates payload via Zod, securely hashes the password with bcrypt, and automatically links the default `CUSTOMER` role inside a database transaction.

- **URL:** `/signup`
- **Method:** `POST`
- **Auth Required:** No

#### Request Headers
| Header | Value | Required |
|:---|:---|:---|
| `Content-Type` | `application/json` | Yes |

#### Request Body
| Field | Type | Validation Rules | Description |
|:---|:---|:---|:---|
| `email` | `string` | Valid email format, trimmed, converted to lowercase | The user's unique email address |
| `password` | `string` | Min 6 characters, max 100 characters | The user's plain-text password |

##### Example Request:
```json
{
  "email": "traveler@example.com",
  "password": "Password123!"
}
```

#### Responses

##### `201 Created`
Returned when the account is successfully created. Password hash is never exposed.
```json
{
  "success": true,
  "message": "Successfully created a new user",
  "data": {
    "id": "c71e29c8-7ea8-4e31-89d5-78e51b3a16fc",
    "email": "traveler@example.com",
    "createdAt": "2026-09-25T08:00:00.000Z",
    "updatedAt": "2026-09-25T08:00:00.000Z",
    "Roles": [
      {
        "id": 2,
        "role": "CUSTOMER"
      }
    ]
  },
  "error": {}
}
```

##### `400 Bad Request` (Zod Validation Error)
```json
{
  "success": false,
  "message": "Validation failed for request data",
  "data": {},
  "error": {
    "statusCode": 400,
    "explanation": [
      "body.email: Please provide a valid email address",
      "body.password: Password must be at least 6 characters long"
    ]
  }
}
```

##### `409 Conflict` (Email Already Registered)
```json
{
  "success": false,
  "message": "User already exists with this email address",
  "data": {},
  "error": {
    "statusCode": 409,
    "explanation": [
      "email must be unique"
    ]
  }
}
```

---

### 2. User Sign In (Authentication)

Authenticates user credentials and returns a signed JSON Web Token (JWT) along with public user metadata.

- **URL:** `/signin`
- **Method:** `POST`
- **Auth Required:** No

#### Request Headers
| Header | Value | Required |
|:---|:---|:---|
| `Content-Type` | `application/json` | Yes |

#### Request Body
| Field | Type | Validation Rules | Description |
|:---|:---|:---|:---|
| `email` | `string` | Valid email, trimmed, lowercase | Registered email |
| `password` | `string` | Non-empty string | Account password |

##### Example Request:
```json
{
  "email": "traveler@example.com",
  "password": "Password123!"
}
```

#### Responses

##### `200 OK`
```json
{
  "success": true,
  "message": "Successfully signed in",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "c71e29c8-7ea8-4e31-89d5-78e51b3a16fc",
      "email": "traveler@example.com",
      "Roles": [
        {
          "id": 2,
          "role": "CUSTOMER"
        }
      ]
    }
  },
  "error": {}
}
```

##### `401 Unauthorized` (Invalid Credentials / Non-existent User)
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": {},
  "error": {
    "statusCode": 401,
    "explanation": "Invalid email or password"
  }
}
```

---

### 3. Verify Token

Used by client applications and inter-service middlewares (e.g. Booking Service) to validate authentication tokens.

- **URL:** `/verify`
- **Method:** `GET`
- **Auth Required:** Yes (`x-access-token` header OR standard `Authorization: Bearer <token>`)

#### Request Headers
| Header | Value | Required |
|:---|:---|:---|
| `x-access-token` | `<jwt_token>` | Either this or Authorization |
| `Authorization` | `Bearer <jwt_token>` | Either this or x-access-token |

#### Responses

##### `200 OK`
```json
{
  "success": true,
  "message": "User is authenticated and token is valid",
  "data": {
    "id": "c71e29c8-7ea8-4e31-89d5-78e51b3a16fc",
    "email": "traveler@example.com",
    "Roles": [
      {
        "id": 2,
        "role": "CUSTOMER"
      }
    ]
  },
  "error": {}
}
```

##### `401 Unauthorized` (Token Missing or Expired)
```json
{
  "success": false,
  "message": "Authentication token has expired. Please sign in again",
  "data": {},
  "error": {
    "statusCode": 401,
    "explanation": "Token has expired"
  }
}
```

---

### 4. Check Admin Status

Checks whether the authenticated user holds the `ADMIN` role. Uses exclusively the JWT authentication token to verify.
The token must be valid and contain the `ADMIN` role, which is then double-checked against the database for active confirmation.

- **URL:** `/isAdmin`
- **Method:** `GET`
- **Auth Required:** Yes (`x-access-token` header OR standard `Authorization: Bearer <token>`)

#### Request Headers
| Header | Value | Required |
|:---|:---|:---|
| `x-access-token` | `<jwt_token>` | Either this or Authorization |
| `Authorization` | `Bearer <jwt_token>` | Either this or x-access-token |

#### Verification Business Logic
1. **Token Presence & Format:** Request must provide a valid JWT access token in headers.
2. **Token Authenticity:** Token signature and expiry are validated via `jwt.verify`.
3. **Real-time Database Authorization:** Queries user role permissions directly from the database for `decoded.id` in real time, accurately reflecting promotions and revocations immediately.

#### Responses

##### `200 OK` (Admin Confirmed)
```json
{
  "success": true,
  "message": "Successfully fetched whether user is admin or not",
  "data": {
    "isAdmin": true
  },
  "error": {}
}
```

##### `200 OK` (Not an Admin)
```json
{
  "success": true,
  "message": "Successfully fetched whether user is admin or not",
  "data": {
    "isAdmin": false
  },
  "error": {}
}
```

##### `401 Unauthorized` (Token Missing, Expired/Invalid, or User No Longer Exists)
```json
{
  "success": false,
  "message": "Authentication token is missing. Please provide it in x-access-token or Authorization Bearer header",
  "data": {},
  "error": {
    "statusCode": 401,
    "explanation": "Authentication token is missing. Please provide it in x-access-token or Authorization Bearer header"
  }
}
```

---

### 5. Health Check

- **URL:** `/health`
- **Method:** `GET`
- **Auth Required:** No

#### Response: `200 OK`
```json
{
  "status": "healthy",
  "service": "Auth Service",
  "timestamp": "2026-09-25T08:15:00.000Z"
}
```

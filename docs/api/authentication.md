# Authentication API Specification — KENENISA OS

## Overview

KENENISA OS utilizes a protected personal authentication architecture. Authentication is managed strictly server-side using cryptographically generated 256-bit random session tokens.

Tokens are transmitted exclusively via HTTP-Only, Secure cookies (`auth_session`). Database persistence stores only the SHA-256 cryptographic hash (`tokenHash`) to ensure credentials cannot be leaked in the event of database compromise.

---

## Endpoints

### 1. `POST /api/v1/auth/login`

Authenticates the system OWNER and issues a secure HTTP-Only session cookie.

- **Authentication:** Unauthenticated
- **Rate Limit:** 10 requests / 15 minutes window

#### Request Body

```json
{
  "email": "kenenisa@kenenisa-os.internal",
  "password": "KenenisaOS#2026!SecureOwnerPass"
}
```

#### Response — 200 OK

- **Set-Cookie Header:** `auth_session=<token>; HttpOnly; Secure; SameSite=Lax; Path=/`

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "00000000-0000-0000-0000-000000000000",
      "email": "kenenisa@kenenisa-os.internal",
      "firstName": "Kenenisa",
      "lastName": "Beyan",
      "displayName": "Kenenisa Beyan",
      "role": "OWNER",
      "isActive": true,
      "createdAt": "2026-09-15T00:00:00.000Z",
      "updatedAt": "2026-09-15T00:00:00.000Z"
    }
  },
  "meta": {
    "requestId": "req-12345",
    "timestamp": "2026-09-15T23:00:00.000Z",
    "path": "/api/v1/auth/login"
  }
}
```

#### Error Response — 401 Unauthorized

Generic credentials failure message to prevent email enumeration attacks:

```json
{
  "success": false,
  "message": "Invalid email or password",
  "error": {
    "code": "AUTHENTICATION_ERROR"
  }
}
```

---

### 2. `POST /api/v1/auth/logout`

Revokes the caller's active session in PostgreSQL and clears the authentication cookie.

- **Authentication:** Safe for authenticated and unauthenticated callers.

#### Response — 200 OK

- **Set-Cookie Header:** `auth_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT`

```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": null
}
```

---

### 3. `GET /api/v1/auth/me`

Retrieves the currently authenticated user identity.

- **Authentication:** Required (Valid `auth_session` cookie)

#### Response — 200 OK

```json
{
  "success": true,
  "message": "Authenticated user profile retrieved successfully",
  "data": {
    "user": {
      "id": "00000000-0000-0000-0000-000000000000",
      "email": "kenenisa@kenenisa-os.internal",
      "firstName": "Kenenisa",
      "lastName": "Beyan",
      "displayName": "Kenenisa Beyan",
      "role": "OWNER",
      "isActive": true,
      "createdAt": "2026-09-15T00:00:00.000Z",
      "updatedAt": "2026-09-15T00:00:00.000Z"
    }
  }
}
```

#### Error Response — 401 Unauthorized

```json
{
  "success": false,
  "message": "Authentication required",
  "error": {
    "code": "AUTHENTICATION_ERROR"
  }
}
```

---

### 4. `POST /api/v1/auth/logout-all`

Revokes all active sessions for the authenticated user across all devices.

- **Authentication:** Required

#### Response — 200 OK

```json
{
  "success": true,
  "message": "All active sessions revoked successfully",
  "data": null
}
```

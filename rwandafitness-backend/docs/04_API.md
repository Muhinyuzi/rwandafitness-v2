# RwandaFitness — API Documentation

Base URL:

```text
/api/
```

## Auth

### Register

```http
POST /api/auth/register/
```

Body:

```json
{
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "phone": "",
  "role": "client",
  "password": "password123",
  "password_confirm": "password123"
}
```

### Login

```http
POST /api/auth/login/
```

### Current User

```http
GET /api/auth/me/
```

### Verify Email

```http
GET /api/auth/verify-email/{token}/
```

### Forgot Password

```http
POST /api/auth/forgot-password/
```

### Reset Password

```http
POST /api/auth/reset-password/{token}/
```

## Coaches

```http
GET /api/coaches/
GET /api/coaches/{id}/
GET /api/coaches/me/
PATCH /api/coaches/me/
```

## Gyms

```http
GET /api/gyms/
GET /api/gyms/{slug}/
```

## Articles

```http
GET /api/articles/
GET /api/articles/featured/
GET /api/articles/{slug}/
```

## Coaching Requests

```http
POST /api/requests/create/
GET /api/requests/
```

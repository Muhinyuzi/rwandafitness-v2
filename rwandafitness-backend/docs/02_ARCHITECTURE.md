# RwandaFitness — Architecture

## Stack

### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- Django
- Django REST Framework
- Token Authentication

### Database
- SQLite for development
- PostgreSQL for production

### Email
- Brevo SMTP

### Media
- Django media files for local development
- Cloud storage planned for production

## High-Level Architecture

```text
User Browser
    ↓
Next.js Frontend
    ↓
Django REST API
    ↓
Database
    ↓
Brevo SMTP
```

## Main Modules

- accounts
- coaches
- gyms
- articles
- requests_app
- programs
- core

## Authentication Flow

```text
Register
  ↓
Email Verification
  ↓
Login
  ↓
Authenticated API Requests
```

## Password Reset Flow

```text
Forgot Password
  ↓
Brevo Email
  ↓
Reset Link
  ↓
New Password
```

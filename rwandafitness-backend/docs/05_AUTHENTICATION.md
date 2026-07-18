# RwandaFitness — Authentication

## Overview

RwandaFitness uses Django REST Framework token authentication.

## Register Flow

```text
User submits registration form
    ↓
Backend creates user
    ↓
Backend generates email verification token
    ↓
Brevo sends verification email
    ↓
User clicks verification link
    ↓
email_verified=True
    ↓
User can log in
```

## Login Rules

A user can log in only if:
- the credentials are valid
- the account is active
- the email address is verified

## Forgot Password Flow

```text
User enters email
    ↓
Backend creates password reset token
    ↓
Brevo sends reset link
    ↓
User clicks link
    ↓
User submits new password
    ↓
Token is deleted
```

## Token Expiration

Both verification and reset tokens expire after 24 hours.

## Email Provider

Brevo SMTP is used for transactional emails.

# RwandaFitness — Deployment Guide

## Frontend

Recommended:
- Vercel

Environment variable:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend-domain.com
```

## Backend

Recommended:
- Render
- Railway
- DigitalOcean
- VPS with Nginx + Gunicorn

## Production Environment Variables

```env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-backend-domain.com

DB_ENGINE=postgresql
DB_NAME=rwandafitness
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=your-db-host
DB_PORT=5432

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
CSRF_TRUSTED_ORIGINS=https://your-frontend-domain.com

FRONTEND_URL=https://your-frontend-domain.com

EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-brevo-login
EMAIL_HOST_PASSWORD=your-brevo-smtp-key
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=RwandaFitness <noreply@rwandafitness.com>
```

## Deployment Checklist

- [ ] Set production environment variables
- [ ] Configure PostgreSQL
- [ ] Run migrations
- [ ] Create superuser
- [ ] Configure static files
- [ ] Configure media files
- [ ] Configure CORS
- [ ] Configure HTTPS
- [ ] Test email verification
- [ ] Test password reset

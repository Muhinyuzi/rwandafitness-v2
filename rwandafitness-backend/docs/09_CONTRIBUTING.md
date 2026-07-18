# RwandaFitness — Contributing Guide

## Branch Naming

Use clear branch names:

```text
feature/reviews
fix/login-error
docs/update-roadmap
```

## Commit Style

Examples:

```text
feat: add email verification
fix: correct coach profile endpoint
docs: update deployment guide
```

## Backend Setup

```bash
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

## Frontend Setup

```bash
npm install
npm run dev
```

## Code Style

### Backend
- Python
- Django
- DRF
- snake_case

### Frontend
- TypeScript
- Next.js
- Tailwind CSS
- PascalCase for components
- camelCase for variables

## Pull Request Checklist

- [ ] Code runs locally
- [ ] No hardcoded local URLs
- [ ] Environment variables are used
- [ ] No secrets committed
- [ ] Feature tested manually

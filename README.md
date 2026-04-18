# 🏋🏾‍♂️ RwandaFitness v2

**RwandaFitness v2** is a modern, scalable web platform focused on **fitness, health, and active lifestyle in Africa**.

This project represents the **next generation** of the original RwandaFitness platform (launched in 2018) and is being rebuilt from scratch with a **modern tech stack**, clean architecture, and long-term product vision.

While RwandaFitness v2 is a **real business-oriented project**, it is also used to demonstrate professional **full-stack engineering skills** in a real-world context.

---

## 🌍 Vision

RwandaFitness v2 aims to become:

- A **digital fitness platform** for African audiences
- A foundation for **premium content**, coaching programs, and community features
- A scalable base for future expansion into a broader brand (**Africore**), including:
  - Sportswear & footwear
  - Lifestyle & wellness products
  - Digital services (subscriptions, dashboards, analytics)

---

## 🚀 Current Status

- ✅ New architecture defined
- ✅ Monorepo setup (Frontend + Backend)
- 🚧 Active development (v2)
- 🔁 Old Flask-based website still running in production (v1)

> The legacy RwandaFitness (Flask) site will eventually be **replaced** by this new version once v2 is stable.

---

## 🧱 Architecture Overview

This repository uses a **monorepo architecture**, separating concerns clearly while keeping everything in a single project.

rwandafitness-v2/
├─ apps/
│ ├─ web/ # Next.js frontend (public + admin)
│ └─ api/ # FastAPI backend
│
├─ packages/ # Shared packages (UI, types, config)
├─ infra/ # Infrastructure & scripts
├─ docs/ # Product & technical documentation
├─ docker-compose.yml
├─ .env.example
└─ README.md

yaml
Copier le code

---

## 🖥️ Frontend (Next.js)

**Tech stack**
- Next.js (App Router)
- TypeScript
- Modern component-based architecture
- SEO-friendly (SSR / SSG)
- Ready for public pages + admin dashboard

**Features (planned & in progress)**
- Marketing pages (home, programs, blog, contact)
- Authentication (login / register)
- Admin dashboard
- API integration with backend
- Responsive UI (mobile-first)

---

## ⚙️ Backend (FastAPI)

**Tech stack**
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT authentication
- PostgreSQL
- Alembic migrations

**Features (planned & in progress)**
- Authentication & authorization (RBAC)
- User management
- Fitness programs
- Content management (articles, programs)
- Email notifications (disabled in demo environments if restricted)
- Clean service/repository architecture

---

## 🔐 Environments

The project is designed to support multiple environments:

- `development`
- `demo`
- `production`

Environment variables are managed via `.env` files and infrastructure configuration.

---

## 🐳 Docker Support

The project is fully Docker-ready.

```bash
docker-compose up --build
This will start:

Frontend (Next.js)

Backend (FastAPI)

Database (PostgreSQL)

🧪 Testing
Backend testing is handled using Pytest.

Planned coverage includes:

Authentication

Users

Permissions

Core business logic

📦 Why This Project Matters
This is not just a portfolio project.

RwandaFitness v2 is:

A real product idea with long-term vision

Built with production-grade tools

Designed to scale beyond a single country

A foundation for future African digital products

At the same time, it demonstrates:

Full-stack architecture skills

Clean backend design

Modern frontend practices

DevOps fundamentals

🔮 Roadmap (High-level)
 Core backend API

 Authentication & admin access

 Public marketing pages

 Content management

 Deployment (cloud)

 Community & subscriptions

 Transition to broader brand (Africore)

👤 Author
Jean Claude Muhinyuzi
📍 Québec, Canada
💼 Software Development & Telecommunications
🔗 GitHub: https://github.com/Muhinyuzi
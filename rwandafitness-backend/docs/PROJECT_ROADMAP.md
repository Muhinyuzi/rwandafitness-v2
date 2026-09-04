# RwandaFitness Project Roadmap

> Living project document for development, growth and deployment.

## Project Status

| Area | Status |
|---|---|
| Backend (Django + DRF) | ✅ |
| Frontend (Next.js) | ✅ |
| Authentication | ✅ |
| Email Verification | ✅ |
| Forgot / Reset Password | ✅ |
| Coaches | ✅ |
| Gyms | ✅ |
| Articles | ✅ |
| Videos | ✅ |
| Reviews & Ratings | ✅ |
| Coach Requests | ✅ |
| Coach Dashboard | ✅ |
| Client Dashboard | ✅ |
| Notifications | ✅ |
| Multilingual EN / RW | ✅ |
| SEO / Sitemap | ✅ |
| Production Deployment | ✅ |
| AI Content Agent | 🚧 Next |

---

# Completed

## Core Platform

- [x] Django + Django REST Framework backend
- [x] Next.js frontend
- [x] Environment variables
- [x] SQLite development support
- [x] PostgreSQL production support
- [x] Production deployment
- [x] HTTPS
- [x] rwandafitness.com domain
- [x] Static and media files
- [x] Production API configuration

## Authentication

- [x] Registration
- [x] Login
- [x] Token authentication
- [x] Email verification
- [x] Brevo email integration
- [x] Forgot password
- [x] Reset password
- [x] Role-based navigation
- [x] Client accounts
- [x] Coach accounts
- [x] Admin accounts

## Internationalization

- [x] English
- [x] Kinyarwanda
- [x] next-intl integration
- [x] Language switcher
- [x] Multilingual navigation
- [x] Multilingual article system
- [x] ArticleTranslation model
- [x] EN / RW article slugs

---

# Coaches

- [x] Coach profiles
- [x] Coach detail pages
- [x] Specialties
- [x] Years of experience
- [x] City
- [x] Price per session
- [x] Online coaching availability
- [x] In-person availability
- [x] Gym association
- [x] Profile photos
- [x] Coach gallery
- [x] Instagram
- [x] Verified status
- [x] Reviews & ratings
- [x] Coach videos
- [x] Coaching requests
- [x] Coach dashboard
- [x] Request status management

## Future Coach Features

- [ ] Certifications
- [ ] Detailed availability / calendar
- [ ] Coach booking
- [ ] Premium coach profiles

---

# Gyms

- [x] Gym listing
- [x] Gym detail pages
- [x] Description
- [x] City
- [x] Address
- [x] Phone
- [x] Email
- [x] Website
- [x] Opening hours
- [x] Cover image
- [x] Gallery
- [x] Instagram
- [x] Facebook
- [x] Latitude / longitude
- [x] Verified status
- [x] Coaches associated with gyms
- [x] Gym videos

## Future Gym Features

- [ ] Equipment listing
- [ ] Interactive Google Maps
- [ ] Gym reviews
- [ ] Gym membership information
- [ ] Premium gym profiles

---

# Articles

- [x] Article listing
- [x] Article detail
- [x] Categories
- [x] Featured articles
- [x] Cover images
- [x] Rich text editor
- [x] English translations
- [x] Kinyarwanda translations
- [x] Localized slugs
- [x] Article videos
- [x] SEO-friendly URLs

## Future Article Features

- [ ] Article search
- [ ] Related articles
- [ ] Internal recommendation system
- [ ] Advanced SEO metadata

---

# Videos

- [x] Videos section
- [x] Video detail page
- [x] YouTube support
- [x] Video thumbnails
- [x] English / Kinyarwanda language support
- [x] Videos associated with coaches
- [x] Videos associated with gyms
- [x] Videos associated with articles

---

# Coaching Workflow

- [x] Client sends coaching request
- [x] Coach receives request
- [x] Pending status
- [x] Accepted status
- [x] Rejected status
- [x] Completed status
- [x] Client request history
- [x] Coach request management
- [x] Request detail page
- [x] Client reviews after completed service

---

# Dashboards

## Coach Dashboard

- [x] Dashboard
- [x] Request statistics
- [x] Recent requests
- [x] Request management
- [x] Edit coach profile

## Client Dashboard

- [x] Dashboard
- [x] Request statistics
- [x] Recent requests
- [x] View all requests

## Notifications

- [x] Notifications page
- [x] Unread notifications
- [x] Mark all as read
- [x] Coaching activity notifications

---

# SEO

- [x] sitemap.xml
- [x] robots.txt
- [x] English URLs
- [x] Kinyarwanda URLs
- [x] Dynamic coach URLs in sitemap
- [x] Dynamic gym URLs in sitemap
- [x] Dynamic article URLs in sitemap
- [x] Video pages in sitemap structure
- [x] Google Search Console setup
- [x] Sitemap submitted to Google

## SEO Next Steps

- [ ] Improve page metadata
- [ ] Structured data / Schema.org
- [ ] Article SEO metadata
- [ ] Coach structured data
- [ ] Gym structured data
- [ ] Internal linking
- [ ] Content publishing strategy

---

# Production

- [x] Production server
- [x] PostgreSQL
- [x] Production settings
- [x] Static files
- [x] Media files
- [x] HTTPS
- [x] Domain
- [x] Frontend production build
- [x] Backend production deployment
- [x] Sitemap
- [x] robots.txt

## Infrastructure Improvements

- [ ] Automated database backups
- [ ] Media backup strategy
- [ ] Error monitoring
- [ ] Application monitoring
- [ ] CI/CD pipeline

---

# Content & Launch

- [x] Add initial real gyms
- [x] Add initial coach profiles
- [x] Production website online

- [ ] Verify/update all existing gym information
- [ ] Add more real coaches
- [ ] Add more real gyms
- [ ] Publish articles consistently
- [ ] Publish fitness videos
- [ ] Recover selected valuable legacy content
- [ ] Social media launch
- [ ] Coach outreach
- [ ] Gym outreach

---

# NEXT MAJOR FEATURE — RwandaFitness AI Content Agent

## Goal

Build an end-to-end AI agent that assists with the creation of
high-quality bilingual RwandaFitness content.

The agent must create drafts only.

Human approval is required before publication.

## AI Content Agent V1

- [ ] Create AI agent Django module
- [ ] Configure LLM provider
- [ ] Create agent system instructions
- [ ] Create structured article output schema
- [ ] Implement `search_existing_articles`
- [ ] Detect similar / duplicate topics
- [ ] Generate article plan
- [ ] Generate English article
- [ ] Generate Kinyarwanda article
- [ ] Generate EN slug
- [ ] Generate RW slug
- [ ] Generate excerpts
- [ ] Select article category
- [ ] Generate SEO title
- [ ] Generate meta description
- [ ] Validate generated content
- [ ] Create Article draft
- [ ] Create EN ArticleTranslation
- [ ] Create RW ArticleTranslation
- [ ] Human review in Django Admin
- [ ] Manual publication only
- [ ] Tests
- [ ] Production deployment

## AI Agent Tools

### search_existing_articles()

Search existing RwandaFitness articles before generating new content.

Purpose:
- prevent duplicates
- discover related content
- provide context to the agent

### search_coaches()

Find relevant RwandaFitness coaches.

Future use:
- recommend relevant coaches inside articles
- create internal links

### search_gyms()

Find relevant gyms.

Future use:
- contextual local recommendations
- internal linking

### search_videos()

Find related RwandaFitness videos.

Future use:
- associate educational videos with articles

### create_article_draft()

Create the final Article and both translations in Django.

Important:

The tool MUST create drafts only.

It must never automatically publish an article.

---

# AI Content Agent V2 — SEO Agent

- [ ] Analyze existing articles
- [ ] Detect weak content
- [ ] Detect duplicate topics
- [ ] Suggest SEO improvements
- [ ] Suggest internal links
- [ ] Suggest related articles
- [ ] Suggest coaches
- [ ] Suggest gyms
- [ ] Suggest videos
- [ ] Generate improved metadata

---

# AI Content Agent V3 — Editorial Planner

- [ ] Generate weekly content ideas
- [ ] Generate monthly editorial calendar
- [ ] Identify missing fitness topics
- [ ] Balance categories
- [ ] Balance EN / RW content
- [ ] Track published topics
- [ ] Avoid repetitive content

---

# Future AI — RwandaFitness Discovery Agent

Public-facing AI assistant.

Possible capabilities:

- Find coaches
- Find gyms
- Recommend articles
- Recommend videos
- Understand fitness goals
- Search RwandaFitness content
- Build personalized discovery paths

Later:

- Create coaching requests after explicit user confirmation
- Personalized recommendations
- Conversation history

---

# Long-Term Product Roadmap

## Phase 1 — Foundation

- Coaches
- Gyms
- Articles
- Videos
- Reviews
- Search
- SEO

## Phase 2 — Community

- Fitness challenges
- Events
- Groups
- Community features
- Nutrition content

## Phase 3 — Marketplace

- Coach booking
- Payments
- Premium services
- Premium coach profiles
- Premium gym profiles

## Phase 4 — Intelligence

- AI Content Agent
- SEO Agent
- Editorial Planner
- Fitness Discovery Agent
- Personalized recommendations

## Phase 5 — Mobile

- RwandaFitness mobile application
- Push notifications
- Mobile coaching experience

---

# Architecture

Backend:
Django + Django REST Framework

Frontend:
Next.js

Database:
SQLite (development)
PostgreSQL (production)

Authentication:
Token Authentication + Email Verification

Email:
Brevo

Languages:
English
Kinyarwanda

AI:
LLM + Tool Calling + Django Services

Production:
rwandafitness.com

---

# Core Principle

RwandaFitness is not a gym management system.

RwandaFitness is a fitness discovery, content and community platform
built for Rwanda.

AI should support the ecosystem — not replace coaches, gyms or
professional expertise.

---

Last updated: August 2026
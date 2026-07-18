# RwandaFitness — Database

## Main Models

## User

Custom user model extending Django `AbstractUser`.

Main fields:
- email
- username
- full_name
- phone
- role
- email_verified
- created_at

Roles:
- admin
- coach
- client

## CoachProfile

Represents a fitness coach profile.

Main fields:
- user
- bio
- specialty
- years_experience
- city
- price_per_session
- photo
- gym
- is_verified
- available_online
- available_in_person

## Gym

Represents a gym or fitness center.

Main fields:
- name
- description
- city
- address
- phone
- email
- website
- opening_hours
- cover_image
- slug
- is_verified

## Article

Represents a fitness article.

Main fields:
- title
- slug
- excerpt
- content
- cover_image
- author_name
- category
- is_published
- is_featured
- published_at

## CoachingRequest

Represents a request sent by a client to a coach.

Main fields:
- client
- coach
- goal
- message
- status
- created_at

## EmailVerificationToken

Used to verify user email addresses.

Main fields:
- user
- token
- created_at

Expires after 24 hours.

## PasswordResetToken

Used for password reset links.

Main fields:
- user
- token
- created_at

Expires after 24 hours.

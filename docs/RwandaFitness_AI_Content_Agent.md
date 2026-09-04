# RwandaFitness AI Content Agent

> Technical and product specification for the first AI agent integrated
> into RwandaFitness.

**Status:** Planned / In development\
**Project:** RwandaFitness V2\
**Backend:** Django + Django REST Framework\
**Frontend:** Next.js\
**AI integration:** LLM + tool calling + Django services\
**Last updated:** August 2026

------------------------------------------------------------------------

## 1. Overview

The **RwandaFitness AI Content Agent** is an internal editorial
assistant for creating high-quality bilingual RwandaFitness content.

V1 is not a public chatbot. It is an administrative agent connected to
the existing Django backend and article system.

Its job is to transform a topic supplied by an administrator into a
structured article draft in:

-   English (`en`)
-   Kinyarwanda (`rw`)

Before writing, the agent checks existing RwandaFitness content. It then
plans the article, generates both translations and SEO information,
validates the result, and creates a **draft** for human review.

**The agent must never publish an article automatically.**

------------------------------------------------------------------------

## 2. Main Objective

Current manual workflow:

1.  Choose a topic.
2.  Check for similar articles.
3.  Plan the article.
4.  Write English content.
5.  Prepare Kinyarwanda content.
6.  Create titles, excerpts and slugs.
7.  Choose the category.
8.  Prepare SEO information.
9.  Enter everything into Django.
10. Review and publish.

Target workflow:

``` text
Admin enters topic
        ↓
AI Content Agent
        ↓
Search existing RwandaFitness content
        ↓
Detect duplicates / evaluate topic
        ↓
Create editorial plan
        ↓
Generate EN + RW
        ↓
Generate SEO metadata
        ↓
Validate structured output
        ↓
Create Django draft
        ↓
Human review
        ↓
Manual publication
```

------------------------------------------------------------------------

## 3. Core Principles

### Human approval

The AI may search, plan, generate, translate, validate and create a
draft.

It may **not** publish, mark an article as published, or bypass
administrator review.

### Use RwandaFitness data

The agent should work with the platform's real data instead of acting as
an isolated text generator.

It will eventually be able to inspect:

-   Articles
-   Coaches
-   Gyms
-   Videos

### Structured output

The LLM should return a validated structure compatible with Django
rather than arbitrary text.

### Start small

V1 focuses on one reliable workflow:

**topic → search → plan → generate → validate → draft**

------------------------------------------------------------------------

## 4. Existing Article Architecture

RwandaFitness already uses Django articles with multilingual
`ArticleTranslation` records.

Translations include:

``` text
language
title
slug
excerpt
content
```

Supported languages:

``` text
en
rw
```

Conceptually:

``` text
Article
├── category
├── author_name
├── cover_image
├── is_published
├── is_featured
└── translations
    ├── EN
    │   ├── title
    │   ├── slug
    │   ├── excerpt
    │   └── content
    └── RW
        ├── title
        ├── slug
        ├── excerpt
        └── content
```

The agent must integrate with the existing models rather than create a
second content system.

------------------------------------------------------------------------

## 5. Proposed Django Structure

Create a dedicated application:

``` bash
python manage.py startapp ai_content
```

Proposed structure:

``` text
ai_content/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── urls.py
├── services/
│   ├── __init__.py
│   ├── agent.py
│   ├── tools.py
│   ├── schemas.py
│   ├── prompts.py
│   └── validators.py
└── tests/
    ├── __init__.py
    ├── test_tools.py
    ├── test_agent.py
    └── test_draft_creation.py
```

### `agent.py`

Coordinates the workflow: receives the topic, calls tools and the LLM,
validates the result, and coordinates draft creation.

### `tools.py`

Safe application functions exposed to the agent.

Initial tools:

``` python
search_existing_articles(...)
create_article_draft(...)
```

Later:

``` python
search_coaches(...)
search_gyms(...)
search_videos(...)
```

### `schemas.py`

Defines structured inputs and outputs.

Expected article result:

``` text
category
seo_title
meta_description
english
    title
    slug
    excerpt
    content
kinyarwanda
    title
    slug
    excerpt
    content
```

### `prompts.py`

Contains system instructions and editorial prompts.

### `validators.py`

Performs application-level validation before data is saved.

------------------------------------------------------------------------

## 6. Agent Tools

### `search_existing_articles(topic)`

Searches RwandaFitness before new content is generated.

Useful returned fields:

``` text
article_id
category
language
title
slug
excerpt
published_at
```

The goal is to identify duplicate or closely related topics.

V1 can begin with normal Django/database search. Vector search is not
required initially.

### `create_article_draft(payload)`

Creates the parent `Article` and both translations after validation.

Critical rule:

``` python
is_published = False
```

This must be enforced by application code, never controlled by the LLM.

### Future tools

``` python
search_coaches(...)
search_gyms(...)
search_videos(...)
```

These will support internal linking and relevant RwandaFitness
recommendations.

------------------------------------------------------------------------

## 7. V1 Workflow

### Step 1 --- Admin enters a topic

Example:

``` text
Home workouts for beginners in Rwanda
```

### Step 2 --- Search existing articles

The agent calls `search_existing_articles`.

If a close duplicate exists, it should recommend another angle rather
than blindly create another article.

### Step 3 --- Build an editorial plan

Example:

``` text
Audience: Beginners
Category: Training
Primary SEO concept: home workout Rwanda
Intent: Educational

Sections:
1. Introduction
2. Why home training works
3. Warm-up
4. Beginner exercises
5. Weekly routine
6. Common mistakes
7. Conclusion
```

### Step 4 --- Generate English

Generate:

``` text
title
slug
excerpt
content
```

### Step 5 --- Generate Kinyarwanda

Generate a natural Kinyarwanda version with:

``` text
title
slug
excerpt
content
```

It should preserve meaning rather than blindly translate word-for-word.

### Step 6 --- SEO

Generate:

``` text
SEO title
meta description
primary topic / keyword
```

### Step 7 --- Validate

Application code verifies:

-   EN translation exists
-   RW translation exists
-   titles exist
-   slugs exist
-   excerpts exist
-   content exists
-   category is valid
-   slugs are valid/unique
-   structured output is valid
-   publication remains disabled

### Step 8 --- Create draft

``` text
Article
    is_published = False

ArticleTranslation
    language = en

ArticleTranslation
    language = rw
```

### Step 9 --- Human review

The administrator reviews facts, wording, Kinyarwanda, formatting, cover
image and SEO information in Django Admin.

### Step 10 --- Manual publication

Only an administrator publishes the final article.

------------------------------------------------------------------------

## 8. Admin Interface

V1 does not need a public Next.js interface.

A simple Django Admin workflow is enough:

``` text
AI Content Agent

Article topic:
[ Home workout for beginners ]

[ Generate Draft ]

✓ Existing articles checked
✓ Plan generated
✓ English generated
✓ Kinyarwanda generated
✓ SEO generated
✓ Validation passed
✓ Draft created

[ Open Draft ]
```

------------------------------------------------------------------------

## 9. Fitness Content Guardrails

Because fitness content can contain health-related claims, the agent
should:

-   avoid medical diagnoses;
-   avoid presenting content as medical advice;
-   avoid unsafe exercise instructions;
-   avoid unsupported health claims;
-   avoid extreme weight-loss recommendations;
-   avoid dangerous supplement recommendations;
-   recommend professional medical guidance where appropriate.

Human review remains mandatory.

------------------------------------------------------------------------

## 10. Security

The LLM receives access only through explicit tools.

It should never receive:

-   database credentials;
-   Django secret keys;
-   email credentials;
-   unrestricted SQL access;
-   shell access;
-   user authentication tokens.

Permissions must be enforced by Django/application code, not by the
model.

------------------------------------------------------------------------

## 11. Observability

Each generation should eventually record:

``` text
request_id
admin_user
topic
model
created_at
status
tools_called
article_created
error
duration
```

Later:

``` text
token usage
estimated cost
prompt version
agent version
```

Do not log secrets or unnecessary personal information.

------------------------------------------------------------------------

## 12. Testing

### Tool tests

-   `search_existing_articles` returns relevant matches
-   handles no results
-   `create_article_draft` creates EN and RW translations
-   drafts are always unpublished
-   invalid categories are rejected
-   duplicate slugs are handled

### Schema tests

-   missing EN → rejected
-   missing RW → rejected
-   empty title → rejected
-   invalid category → rejected
-   invalid structure → rejected

### Agent tests

Mock the LLM and verify:

-   search happens before generation
-   tool errors are handled
-   output is validated
-   automatic publication is impossible
-   valid output creates a draft

### End-to-end test

``` text
topic
→ agent
→ search
→ structured generation
→ validation
→ Article
→ EN translation
→ RW translation
→ unpublished draft
```

------------------------------------------------------------------------

## 13. V1 Definition of Done

-   [ ] `ai_content` Django app created
-   [ ] LLM provider configured with environment variables
-   [ ] Agent system instructions defined
-   [ ] Structured article schema implemented
-   [ ] `search_existing_articles` implemented
-   [ ] Existing articles searched before generation
-   [ ] English generation works
-   [ ] Kinyarwanda generation works
-   [ ] SEO title/meta description generated
-   [ ] Output validation implemented
-   [ ] `create_article_draft` implemented
-   [ ] EN + RW `ArticleTranslation` records created
-   [ ] Generated articles always remain unpublished
-   [ ] Admin can review generated draft
-   [ ] Critical behavior covered by automated tests
-   [ ] Agent deployed and tested in production

------------------------------------------------------------------------

## 14. V2 --- SEO Agent

Possible features:

-   analyze existing articles;
-   detect overlapping topics;
-   identify weak content;
-   improve titles and meta descriptions;
-   suggest internal links;
-   suggest related articles;
-   identify relevant coaches;
-   identify relevant gyms;
-   identify related videos;
-   detect content gaps.

------------------------------------------------------------------------

## 15. V3 --- Editorial Planner

Example request:

``` text
Prepare a 4-week RwandaFitness editorial calendar.
```

The agent could:

1.  inspect published content;
2.  identify missing topics;
3.  balance categories;
4.  avoid duplicates;
5.  propose EN/RW topics;
6.  prepare a publishing schedule.

It proposes content but does not publish it.

------------------------------------------------------------------------

## 16. Future --- Fitness Discovery Agent

A separate public agent could eventually understand requests such as:

``` text
I live in Kigali and want to lose weight.
I prefer in-person training.
```

Tools:

``` text
search_coaches
search_gyms
search_articles
search_videos
```

A later authenticated action could be:

``` text
create_coaching_request
```

Any user-account action must require authorization and explicit user
confirmation.

------------------------------------------------------------------------

## 17. Why This Is an AI Agent

The architecture is not simply:

``` text
Prompt → LLM → Text
```

It is:

``` text
Goal
 ↓
Agent
 ↓
Inspect RwandaFitness through tools
 ↓
Reason about existing content
 ↓
Plan
 ↓
Generate structured output
 ↓
Validate
 ↓
Perform controlled Django action
 ↓
Human approval
```

The system combines:

-   an objective;
-   LLM reasoning;
-   tool calling;
-   real application context;
-   multi-step execution;
-   structured output;
-   validation;
-   controlled actions;
-   human-in-the-loop approval.

------------------------------------------------------------------------

## 18. Portfolio Description

Once V1 is actually implemented and deployed:

> **Built and deployed an end-to-end AI Content Agent for RwandaFitness
> using Python and Django. The agent uses tool calling to inspect
> existing platform content, plan new articles, generate bilingual
> English/Kinyarwanda content and SEO metadata, validate structured
> outputs, and create unpublished Django drafts for human editorial
> review.**

Use this description only after the corresponding functionality is
implemented.

------------------------------------------------------------------------

## 19. Recommended Implementation Order

``` text
1. Create ai_content Django app
2. Inspect existing Article / ArticleTranslation models
3. Implement schemas
4. Implement search_existing_articles
5. Test search tool
6. Configure LLM provider
7. Define system instructions
8. Implement basic agent orchestration
9. Generate structured EN/RW output
10. Implement validators
11. Implement create_article_draft
12. Test draft creation
13. Add Django Admin interface
14. Add logging / observability
15. Run end-to-end tests
16. Deploy
17. Test with real RwandaFitness topics
```

------------------------------------------------------------------------

## 20. First Development Milestone

Start without the LLM.

Implement:

``` python
search_existing_articles(topic)
```

Success criteria:

-   accepts a topic;
-   searches the real RwandaFitness article database;
-   supports the multilingual article structure;
-   returns useful matches;
-   has automated tests;
-   modifies no data.

Once this is reliable, connect the first LLM.

------------------------------------------------------------------------

## 21. Long-Term Vision

``` text
AI Content Agent
      ↓
SEO Agent
      ↓
Editorial Planner
      ↓
Content Recommendation Engine
      ↓
Public Fitness Discovery Agent
```

AI should strengthen the RwandaFitness ecosystem rather than replace
coaches, gyms, editors or professional expertise.

RwandaFitness remains centered on fitness discovery, coaches, gyms,
educational content, community and healthy lifestyle resources in
Rwanda.

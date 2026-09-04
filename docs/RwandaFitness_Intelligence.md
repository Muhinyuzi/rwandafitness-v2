# RwandaFitness Intelligence

> Technical and product specification for the AI intelligence layer of RwandaFitness.

**Status:** Planned / Architecture  
**Project:** RwandaFitness V2  
**Backend:** Django + Django REST Framework  
**Frontend:** Next.js  
**AI integration:** LLM + tool calling + RwandaFitness data + external research  
**Last updated:** September 2026

---

## 1. Overview

**RwandaFitness Intelligence** is the internal AI intelligence layer of RwandaFitness.

It is not primarily a chatbot and it is not simply a content generator.

Its purpose is to help RwandaFitness:

- understand the current state of the platform;
- detect important signals;
- discover opportunities;
- identify risks and weaknesses;
- generate hypotheses;
- recommend actions;
- support strategic decisions;
- learn from previous decisions and their outcomes.

The central question is:

> **What should RwandaFitness do next, and why?**

RwandaFitness Intelligence analyzes both internal platform data and, when appropriate, external information.

It provides recommendations to the administrator.

**The AI advises. The human decides.**

---

## 2. Product Vision

RwandaFitness already contains several connected parts:

```text
Coaches
Gyms
Articles
Videos
Users
Coaching Requests
Reviews
Locations
Content
```

As the platform grows, understanding the relationships between these parts becomes increasingly difficult.

Traditional dashboards answer questions such as:

```text
How many coaches do we have?
How many articles were published?
How many coaching requests were created?
```

RwandaFitness Intelligence should go further:

```text
What does this data mean?

What is changing?

What is missing?

What opportunity are we overlooking?

What should we investigate?

What should we prioritize next?
```

The long-term goal is to give RwandaFitness an intelligence layer capable of observing the ecosystem and assisting the founder with strategic decisions.

---

## 3. Core Principle

RwandaFitness Intelligence follows the reasoning structure:

```text
FACT
  ↓
SIGNAL
  ↓
HYPOTHESIS
  ↓
RECOMMENDATION
  ↓
HUMAN DECISION
  ↓
OUTCOME
```

These concepts must remain distinct.

### Fact

Something directly supported by internal or external evidence.

Example:

```text
19 of 27 active coach profiles are located in Kigali.
```

### Signal

A potentially meaningful pattern derived from one or more facts.

Example:

```text
Coach coverage appears heavily concentrated in Kigali.
```

### Hypothesis

A possible explanation or implication.

Example:

```text
Users outside Kigali may have difficulty finding relevant coaches.
```

A hypothesis must never be presented as a confirmed fact.

### Recommendation

A proposed action.

Example:

```text
Investigate coach acquisition in Huye and Rubavu before expanding
the Coach Finder functionality.
```

### Decision

The administrator decides what to do.

Possible states:

```text
accept
investigate
later
reject
```

### Outcome

Later, RwandaFitness can record whether the decision produced useful results.

---

## 4. The Key Feature: "What Am I Missing?"

One of the main interfaces of RwandaFitness Intelligence will be:

> **What am I missing?**

The agent receives an intentionally broad objective:

```text
Analyze the current state of RwandaFitness,
recent internal changes,
available platform data,
relevant external signals,
previous strategic decisions,
and identify important opportunities,
risks, gaps or inconsistencies that may have
escaped the founder's attention.
```

Example result:

```text
OPPORTUNITY

Title:
Coach coverage outside Kigali

FACT
70% of currently active coaches are located in Kigali.

SIGNAL
Geographic coverage is highly concentrated.

HYPOTHESIS
Users in other major cities may find RwandaFitness less useful
for coach discovery.

RECOMMENDATION
Investigate the availability of coaches in Huye and Rubavu.

CONFIDENCE
84%

PRIORITY
High

SUGGESTED ACTION
Run a city opportunity analysis.
```

The goal is not to generate as many recommendations as possible.

The goal is to surface **a small number of useful insights**.

---

## 5. Intelligence Domains

RwandaFitness Intelligence should eventually analyze several domains.

### 5.1 Growth Intelligence

Questions include:

```text
Where should RwandaFitness expand next?

Which cities are underrepresented?

Where should we recruit coaches?

Where should we recruit gyms?

Which profiles should we try to verify?

Where are important supply gaps?

What acquisition activity could have the highest impact?
```

Data may include:

- coaches;
- gyms;
- locations;
- verification status;
- coaching requests;
- user activity;
- external signals.

---

### 5.2 Content Intelligence

Questions include:

```text
What should RwandaFitness publish?

What topics are missing?

What content is outdated?

What topics are duplicated?

Which articles should be refreshed?

Which coaches or gyms could be connected to existing content?

What external developments deserve RwandaFitness coverage?
```

The existing **AI Content Agent** becomes a specialist within this domain.

RwandaFitness Intelligence identifies the opportunity.

The AI Content Agent may later prepare the content.

Example:

```text
RwandaFitness Intelligence

"We have a significant content gap around beginner strength training."

            ↓

AI Content Agent

Research
Plan
EN draft
RW draft
SEO
Draft creation

            ↓

Human review
```

---

## 6. Relationship with AI Content Agent

The existing:

```text
ai_content/
```

application remains useful.

It should not become the entire RwandaFitness AI architecture.

Its responsibility remains editorial.

Conceptually:

```text
RwandaFitness Intelligence
          │
          ├── Content Intelligence
          │       │
          │       └── AI Content Agent
          │
          ├── Growth Intelligence
          │
          ├── Product Intelligence
          │
          ├── Quality Intelligence
          │
          └── Strategic Memory
```

The existing specification:

```text
docs/RwandaFitness_AI_Content_Agent.md
```

continues to describe the editorial specialist.

This document describes the broader intelligence system.

---

## 7. Product Intelligence

Product Intelligence analyzes how RwandaFitness itself could improve.

Questions may include:

```text
Where are users struggling?

Which features are underused?

Which features may be missing?

Where are users abandoning a journey?

Do users visit many coach profiles without making a request?

Should an existing feature be improved instead of creating a new one?

What product experiment should we run next?
```

Example:

```text
FACT
Users frequently visit multiple coach profiles before submitting
a coaching request.

SIGNAL
Coach comparison activity appears high.

HYPOTHESIS
Users may have difficulty deciding which coach fits their needs.

RECOMMENDATION
Investigate a Coach Matching experience before building
additional discovery filters.
```

The recommendation is not automatically treated as correct.

It remains a hypothesis until validated.

---

## 8. Quality Intelligence

The system should also inspect the quality and freshness of RwandaFitness.

Possible checks:

```text
coach profiles missing important information

gym profiles missing images

profiles that have not been verified recently

articles with broken relationships

articles without related content

coaches without useful profile information

gyms without coaches

videos without related entities

outdated information

potential duplicate records
```

Example:

```text
QUALITY SIGNAL

12 coach profiles have no recent verification information.

RECOMMENDATION

Prioritize profile verification before increasing acquisition
in the same geographic area.
```

---

## 9. External Intelligence

Internal data alone cannot explain everything.

RwandaFitness Intelligence may eventually inspect external sources for:

- Rwanda fitness developments;
- sports and physical activity initiatives;
- health and wellness developments;
- scientific research;
- fitness industry trends;
- local business developments;
- relevant events;
- emerging topics;
- search demand;
- geographic opportunities.

External information must include traceable sources whenever possible.

The system should distinguish clearly between:

```text
INTERNAL FACT

EXTERNAL FACT

INFERENCE
```

External information should never silently become an internal fact.

---

## 10. Strategic Memory

RwandaFitness Intelligence should remember important strategic decisions.

Example:

```text
Recommendation:
Build community challenges.

Decision:
Later

Reason:
Current priority is acquiring and verifying coaches.
```

If the system encounters the same idea shortly afterward, it should know that the idea has already been considered.

Strategic memory can include:

```text
recommendation

decision

reason

decision date

priority

review date

outcome

notes
```

This prevents the AI from repeatedly suggesting ideas that have already been rejected or postponed.

---

## 11. Learning From Outcomes

Long term, the system should learn from what happened after a recommendation.

Example:

```text
Recommendation
Recruit coaches in Rubavu.

Decision
Accepted.

Action
10 coaches contacted.

Result
4 profiles created.
3 verified.
2 coaching requests generated.

Outcome
Positive.
```

This creates a feedback loop:

```text
Recommendation
      ↓
Decision
      ↓
Action
      ↓
Result
      ↓
Evaluation
      ↓
Better future recommendations
```

V1 does not require automated learning.

Initially, outcomes can be recorded manually.

---

## 12. Proposed Django Architecture

Create a dedicated Django application:

```bash
python manage.py startapp intelligence
```

Conceptual structure:

```text
intelligence/
├── __init__.py
├── admin.py
├── apps.py
├── models.py
├── serializers.py
├── urls.py
├── views.py
│
├── services/
│   ├── __init__.py
│   ├── agent.py
│   ├── analyzer.py
│   ├── memory.py
│   └── snapshots.py
│
├── tools/
│   ├── __init__.py
│   ├── platform.py
│   ├── coaches.py
│   ├── gyms.py
│   ├── content.py
│   ├── videos.py
│   ├── requests.py
│   └── external.py
│
├── schemas/
│   ├── __init__.py
│   ├── insights.py
│   └── snapshots.py
│
└── tests/
    ├── __init__.py
    ├── test_platform_snapshot.py
    ├── test_insights.py
    ├── test_decisions.py
    └── test_agent.py
```

This structure is a target architecture.

V1 should implement only what is actually required.

---

## 13. Platform Snapshot

Before connecting an LLM, RwandaFitness Intelligence must be able to inspect RwandaFitness reliably.

The first major tool should be:

```python
inspect_platform()
```

It returns a structured snapshot of the platform.

Example:

```json
{
  "coaches": {
    "total": 27,
    "verified": 14,
    "active": 24,
    "by_city": {
      "Kigali": 19,
      "Huye": 3,
      "Rubavu": 2
    }
  },
  "gyms": {
    "total": 15,
    "verified": 8
  },
  "articles": {
    "total": 21,
    "published": 18,
    "by_category": {}
  },
  "videos": {
    "total": 7
  },
  "coaching_requests": {
    "total": 13,
    "pending": 3,
    "accepted": 7,
    "rejected": 2,
    "completed": 1
  }
}
```

The values above are examples only.

The implementation must always use the real RwandaFitness database.

---

## 14. Why Start Without the LLM

The intelligence system is only as useful as the data it receives.

Therefore:

> **The first milestone is not connecting an AI model.**

First RwandaFitness must reliably understand its own state.

Initial development should focus on deterministic Django services:

```text
inspect coaches
inspect gyms
inspect articles
inspect videos
inspect coaching requests

        ↓

normalize data

        ↓

PlatformSnapshot
```

These functions should be independently testable.

Only after this layer works should an LLM reason over the information.

---

## 15. Initial Tools

### `inspect_platform()`

Provides a high-level platform snapshot.

Must be read-only.

---

### `inspect_coaches()`

Possible output:

```text
total

active

verified

unverified

city distribution

specialty distribution

profiles missing information
```

---

### `inspect_gyms()`

Possible output:

```text
total

verified

unverified

city distribution

gyms without coaches

profiles missing important information
```

---

### `inspect_content()`

Possible output:

```text
published articles

draft articles

category distribution

recent publishing activity

articles without related videos

possible content gaps
```

The existing `ai_content` application may provide specialized
editorial analysis.

---

### `inspect_videos()`

Possible output:

```text
total

published

coach-linked

gym-linked

article-linked

unlinked
```

---

### `inspect_coaching_requests()`

Possible output:

```text
total

pending

accepted

rejected

completed

recent activity
```

No unnecessary personal information should be exposed to the LLM.

---

### `search_external_information()`

Later, the intelligence agent may search trusted external sources.

Returned information should include:

```text
source

title

date

summary

URL/reference

relevance
```

External research must be traceable.

---

### `remember_decision()`

Stores a human decision about an insight.

The AI must not decide on behalf of the administrator.

---

## 16. Initial Data Models

### IntelligenceRun

Represents one intelligence analysis.

Possible fields:

```text
id

question

status

started_at

completed_at

model

error
```

---

### Insight

Represents one discovered opportunity, risk or observation.

Possible fields:

```text
id

run

type

domain

title

fact

signal

hypothesis

recommendation

confidence

priority

evidence

created_at
```

Possible domains:

```text
growth

content

product

quality

strategy
```

Possible types:

```text
opportunity

risk

gap

observation

recommendation
```

---

### InsightDecision

Represents the human response.

Possible fields:

```text
id

insight

decision

reason

created_at

review_at
```

Possible decisions:

```text
accepted

investigate

later

rejected
```

---

## 17. Confidence

Recommendations should include a confidence level.

Example:

```text
Confidence: 84%
```

Confidence should not be presented as scientific probability unless
there is an actual calibrated statistical model behind it.

In early versions it represents an AI assessment based on evidence
quality and completeness.

The interface should communicate this appropriately.

---

## 18. Evidence

Every important insight should contain evidence.

Possible evidence:

```text
RwandaFitness database statistics

specific platform entities

historical platform data

external sources

previous decisions
```

The agent should be able to explain:

> Why are you recommending this?

A recommendation without evidence should have low confidence or be
discarded.

---

## 19. Human-in-the-Loop

RwandaFitness Intelligence is an advisory system.

The AI may:

```text
inspect

search

analyze

compare

identify

rank

recommend

prepare
```

It may not automatically:

```text
publish content

delete content

modify coach profiles

modify gym profiles

contact coaches

send marketing messages

spend money

change platform strategy

create public claims

make irreversible administrative decisions
```

Actions require explicit authorization through application logic.

---

## 20. Security

The LLM must never receive:

```text
Django SECRET_KEY

database credentials

email credentials

API secrets

authentication tokens

passwords

unrestricted SQL access

shell access
```

The agent interacts with RwandaFitness through explicit application
tools.

Example:

```text
LLM
 ↓
inspect_coaches()
 ↓
Django service
 ↓
safe structured result
```

Not:

```text
LLM
 ↓
raw production database
```

---

## 21. Privacy

Only data necessary for the analysis should be sent to an external AI
provider.

Prefer aggregate information.

Example:

```text
GOOD

17 coaching requests were created this month.
9 were accepted.

BAD

Send the full names, email addresses, phone numbers and messages
of every client to the model.
```

Personally identifiable information should not be included unless a
specific authorized workflow genuinely requires it.

---

## 22. Fitness and Health Guardrails

RwandaFitness operates in a fitness and wellness context.

The intelligence system must avoid turning strategic analysis into
medical diagnosis or unsafe health advice.

External health claims should rely on appropriate sources.

The system should distinguish:

```text
fitness information

general wellness information

medical information
```

High-risk medical recommendations are outside the purpose of
RwandaFitness Intelligence.

---

## 23. Observability

Each intelligence run should eventually record:

```text
request_id

admin_user

question

started_at

completed_at

status

model

tools_called

insights_created

duration

error
```

Later:

```text
token usage

estimated cost

prompt version

agent version
```

Never log secrets or unnecessary personal information.

---

## 24. Initial Admin Experience

V1 can begin inside Django Admin.

Example:

```text
RWANDAFITNESS INTELLIGENCE

Platform status
Last analysis: ...

[ Analyze RwandaFitness ]

[ What am I missing? ]

[ Find growth opportunities ]

[ Analyze content ]

------------------------------------------------

HIGH PRIORITY

Coach geographic coverage
Confidence: 86%

[ View ]

------------------------------------------------

MEDIUM PRIORITY

Several articles have no related video
Confidence: 72%

[ View ]
```

Insight detail:

```text
FACT

...

SIGNAL

...

HYPOTHESIS

...

RECOMMENDATION

...

EVIDENCE

...

[ Accept ]

[ Investigate ]

[ Later ]

[ Reject ]
```

A dedicated Next.js interface can be added later.

---

## 25. Conversational Interface

A conversational interface may eventually sit on top of the same
intelligence engine.

Example questions:

```text
What am I missing?

What should I focus on this week?

Why are coaching requests low?

Which city should we target next?

What is weak about RwandaFitness right now?

Where are our biggest content gaps?

Should we build another feature or focus on acquisition?

Find three opportunities I probably haven't considered.

What changed since last month?
```

The chat is an interface.

It is **not the intelligence architecture itself**.

---

## 26. Scheduled Intelligence

Later, RwandaFitness Intelligence may perform scheduled analyses.

Example:

```text
Every week

      ↓

inspect platform

      ↓

compare with previous snapshot

      ↓

research important external changes

      ↓

detect significant signals

      ↓

generate intelligence brief
```

Example output:

```text
WEEKLY INTELLIGENCE BRIEF

3 important changes

2 opportunities

1 risk

1 recommended priority
```

The system should avoid generating notifications when nothing
meaningful has changed.

---

## 27. Future Specialist Capabilities

The architecture may eventually contain specialized intelligence
modules.

```text
                    RwandaFitness Intelligence
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
     Growth                Content               Product
  Intelligence          Intelligence          Intelligence
        │                     │                     │
   acquisition             articles              funnels
   cities                  videos                features
   coaches                 SEO                   behavior
   gyms                    trends                experiments

                              │
                              ▼

                       Quality Intelligence
```

These do not initially need to be independent LLM agents.

Prefer deterministic services and shared tools until separate agents
provide clear value.

---

## 28. Future Public AI

RwandaFitness Intelligence is primarily internal.

Public AI experiences can later use parts of the same infrastructure.

Examples:

### AI Coach Finder

```text
"I live in Kigali.
I want to lose weight.
I prefer evening training."
```

The system searches **real RwandaFitness coaches** and explains relevant
matches.

It must never invent coaches.

### AI Gym Finder

Understands natural-language requirements and searches real gyms.

### Ask RwandaFitness

Answers fitness discovery questions using trusted RwandaFitness content
and appropriate external evidence.

Public agents should remain separate from internal strategic
intelligence permissions.

---

## 29. What RwandaFitness Intelligence Is Not

It is not:

```text
a generic ChatGPT wrapper

a content spam machine

an automatic business manager

an autonomous publisher

an unrestricted database agent

a replacement for coaches

a replacement for human editorial judgment

a system that makes unsupported strategic claims
```

Its purpose is:

> **Turn RwandaFitness data and relevant external signals into useful,
> evidence-based strategic intelligence.**

---

## 30. V1 Scope

V1 should remain intentionally small.

### V1 includes

```text
intelligence Django app

platform inspection services

structured platform snapshot

Insight model

IntelligenceRun model

InsightDecision model

basic deterministic analysis

LLM integration

structured insight output

What am I missing?

human decision workflow

basic observability
```

### V1 does not require

```text
multi-agent framework

vector database

autonomous actions

automatic publishing

complex RAG infrastructure

real-time monitoring

machine learning training

automatic strategy changes

public chatbot
```

---

## 31. V1 Definition of Done

- [ ] `intelligence` Django app created
- [ ] Platform snapshot schema defined
- [ ] `inspect_platform()` implemented
- [ ] Coach statistics implemented
- [ ] Gym statistics implemented
- [ ] Article statistics implemented
- [ ] Video statistics implemented
- [ ] Coaching request statistics implemented
- [ ] Snapshot uses real RwandaFitness data
- [ ] Snapshot contains no unnecessary personal information
- [ ] Snapshot tests implemented
- [ ] `IntelligenceRun` model implemented
- [ ] `Insight` model implemented
- [ ] `InsightDecision` model implemented
- [ ] Basic deterministic signals implemented
- [ ] LLM provider integrated
- [ ] Structured insight schema implemented
- [ ] `What am I missing?` workflow works
- [ ] Facts and hypotheses remain clearly separated
- [ ] Evidence is stored with important insights
- [ ] Administrator can accept/investigate/later/reject
- [ ] Decisions are persisted
- [ ] Critical workflows have automated tests
- [ ] No autonomous destructive actions are possible
- [ ] Production deployment tested

---

## 32. Recommended Implementation Order

```text
1. Create intelligence Django app

2. Inspect current RwandaFitness models

3. Define PlatformSnapshot schema

4. Implement inspect_coaches()

5. Implement inspect_gyms()

6. Implement inspect_content()

7. Implement inspect_videos()

8. Implement inspect_coaching_requests()

9. Implement inspect_platform()

10. Add automated tests

11. Define IntelligenceRun / Insight / InsightDecision

12. Add deterministic signal detection

13. Test insights without an LLM

14. Configure LLM provider

15. Define structured insight schema

16. Implement intelligence agent orchestration

17. Implement "What am I missing?"

18. Add evidence handling

19. Add strategic decision memory

20. Add Django Admin workflow

21. Add observability

22. Run end-to-end tests

23. Deploy

24. Evaluate recommendations using real RwandaFitness data
```

---

## 33. First Development Milestone

**Do not start with the LLM.**

Implement:

```python
inspect_platform()
```

Success criteria:

- reads real RwandaFitness data;
- modifies nothing;
- aggregates coaches;
- aggregates gyms;
- aggregates articles;
- aggregates videos;
- aggregates coaching requests;
- returns a predictable structured result;
- avoids unnecessary personal information;
- has automated tests.

Then implement a few deterministic signals.

Example:

```python
if verified_coach_ratio < threshold:
    create_signal(...)
```

This gives us a baseline against which the later AI reasoning can be
evaluated.

---

## 34. Second Development Milestone

Once platform inspection is reliable:

```text
PlatformSnapshot
       ↓
LLM
       ↓
Structured analysis
       ↓
FACT
SIGNAL
HYPOTHESIS
RECOMMENDATION
CONFIDENCE
EVIDENCE
       ↓
Insight
```

The LLM initially receives read-only tools.

No autonomous modification tools are required.

---

## 35. Third Development Milestone

Add strategic memory:

```text
Insight
   ↓
Jean Claude
   ↓
Accept / Investigate / Later / Reject
   ↓
InsightDecision
   ↓
Future intelligence context
```

This is the point where RwandaFitness Intelligence begins to understand
not only the platform, but also its current strategic direction.

---

## 36. Long-Term Vision

The long-term architecture is:

```text
                     RWANDAFITNESS
                           │
                           ▼
                RWANDAFITNESS INTELLIGENCE
                           │
             Observe • Understand • Recommend
                           │
       ┌───────────────────┼───────────────────┐
       │                   │                   │
       ▼                   ▼                   ▼
   Internal Data      External Signals    Strategic Memory
       │                   │                   │
 Coaches/Gyms            Web              Decisions
 Articles/Videos         Research          Priorities
 Requests                Trends            Outcomes
 Analytics               Rwanda            Experiments
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                     Intelligence
                           │
             FACT → SIGNAL → HYPOTHESIS
                           │
                           ▼
                    RECOMMENDATION
                           │
                           ▼
                       HUMAN
                           │
                        DECISION
                           │
                           ▼
                        ACTION
                           │
                           ▼
                        OUTCOME
                           │
                           └──────────────┐
                                          │
                                          ▼
                                  Strategic Memory
```

The goal is not to make RwandaFitness autonomous.

The goal is to make RwandaFitness **more observable, more informed and
more intelligent as it grows**.

---

## 37. Future Ze Rock Ventures Potential

RwandaFitness Intelligence should initially be designed specifically
for RwandaFitness.

However, the architectural concepts may later become reusable across
other Ze Rock Ventures products:

```text
observation

structured signals

hypotheses

recommendations

evidence

human decisions

outcomes

strategic memory
```

The RwandaFitness implementation should remain focused on solving real
RwandaFitness problems first.

Generalization should happen only after the architecture proves useful
in production.

---

## 38. Success Criteria

RwandaFitness Intelligence is successful if it helps answer questions
such as:

> **What changed?**

> **What is important?**

> **What am I missing?**

> **Why does it matter?**

> **What evidence supports this?**

> **What should we investigate?**

> **What should we do next?**

And, over time:

> **What happened when we followed the previous recommendation?**

The quality of the system should be measured by the usefulness of its
decisions and insights, not by how much text the AI generates.

---

## 39. Guiding Statement

> **RwandaFitness Intelligence does not exist to generate content.**
>
> **It exists to help RwandaFitness understand itself, understand its
> environment, discover opportunities and make better decisions.**

The AI provides intelligence.

**The human remains responsible for the decision.**
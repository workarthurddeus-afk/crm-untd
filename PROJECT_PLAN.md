# Project Plan

## Mission

UNTD OS / UNTD CRM is a personal operating system for Arthur. The product should keep evolving as a focused daily command center, not drift into a generic CRM.

## Existing Modules

### Dashboard

- Status: established
- Current state: Founder Command Center route and component set are present
- Next focus:
  - keep cross-module summaries accurate
  - deepen links into notes, calendar, leads, and tasks

### Leads / CRM / Pipeline

- Status: established
- Current state:
  - routes exist
  - repositories, hooks, seeds, and UI components exist
- Next focus:
  - more cross-links to notes, follow-ups, and calendar actions
  - maintain timeline quality and action visibility

### ICP

- Status: established
- Current state:
  - route, components, seed, repository, service, and tests exist
- Next focus:
  - keep score reasoning visible and useful to lead prioritization

### Notes

- Status: established
- Current state:
  - data layer exists
  - UI exists
  - strategic memory capability exists
- Next focus:
  - richer authoring workflow
  - transform note into task/action flows
  - tighter dashboard integration

### Calendar

- Status: active
- Current state:
  - data layer exists
  - UI route and components exist in the working tree
- Next focus:
  - finish and stabilize calendar UI
  - connect reminders, follow-ups, and dashboard agenda
  - polish conflict handling and daily planning UX

### Tasks

- Status: established
- Current state:
  - route, components, seed, repository, service, and tests exist
- Next focus:
  - stronger ties to notes, leads, and calendar events

### Feedbacks

- Status: partial
- Current state:
  - route exists
- Next focus:
  - formalize data layer if incomplete
  - connect to notes, product signals, and dashboard summaries

### Social Media

- Status: partial
- Current state:
  - route exists
- Next focus:
  - shape data contracts and dashboard relevance

### Meta Ads

- Status: partial
- Current state:
  - route exists
- Next focus:
  - shape data contracts and executive reporting

## Cross-Cutting Work

### Reliability

- keep TypeScript clean
- keep focused tests growing with each module
- reduce global lint debt

### UX Integration

- standardize empty, loading, and error states
- improve cross-module deep links
- surface the most important daily actions faster

### Product Focus

- preserve single-user speed
- reduce cognitive overhead
- avoid generic SaaS drift

## Suggested Execution Order

1. Finish calendar UI against the existing calendar data layer.
2. Fix shared lint blockers that affect app-wide quality.
3. Strengthen dashboard integration with calendar and notes.
4. Complete feedbacks data layer and UI.
5. Expand social media and Meta Ads modules with real operational summaries.

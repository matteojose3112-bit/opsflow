# OpsFlow

OpsFlow is a hands-on business operations dashboard that turns structured business data into operational visibility, useful performance indicators, and actionable priorities.

The first functional milestone focuses on general business operations: tasks, ownership, deadlines, account health, performance metrics, and operational exceptions. It is intentionally built with local sample data first, so the data model and calculations can be understood before introducing a backend.

## Current status

**Phase 1 — Functional Foundation: implementation complete; validation pending**

- [x] Create the GitHub repository and React + TypeScript + Vite application.
- [x] Define TypeScript domain types in `src/types.ts`.
- [x] Add linked sample records for accounts, tasks, activities, KPIs, and exceptions.
- [x] Implement task counts, overdue detection, KPI target comparisons, and dashboard summaries.
- [x] Replace the Vite starter page with the OpsFlow dashboard.
- [x] Add task search and status filters.
- [x] Add responsive layouts, account health, recent activity, performance, and exception views.
- [x] Preserve the Aster-inspired custom cursor and magnetic interactions, including reduced-motion and touch-device handling.
- [x] Update the README, roadmap, and changelog for the implemented milestone.
- [ ] Run `npm run build` and `npm run lint` in the development environment and resolve any findings.
- [ ] Review the dashboard in desktop and mobile previews, verify calculations, and merge the implementation pull request.

The interface uses **sample data in the browser**. It does not yet connect to a database or live business systems. The current feature branch is `feat/opsflow-functional-dashboard`; review the pull request before merging it into `main`.

See [ROADMAP.md](./ROADMAP.md) for the phased plan and [CHANGELOG.md](./CHANGELOG.md) for the development history.

## Dashboard capabilities

- **Operational summary:** active tasks, overdue tasks, open exceptions, and tracked accounts.
- **Task overview:** status and priority labels, owner and account context, due dates, overdue indicators, text search, and status filters.
- **Performance snapshot:** KPI values compared against targets, with direction-aware target interpretation.
- **Exception triage:** open exceptions ordered by severity, with status, owner, and context.
- **Recent activity:** a chronological sample of operational changes.
- **Account health:** a quick view of account owners, industries, and health status.

## Initial data model

The first model is organized around five concepts:

| Concept | Purpose |
| --- | --- |
| **Accounts** | Customers, departments, or business units. |
| **Tasks** | Work with a status, priority, owner, due date, and optional account relationship. |
| **Activities** | A history of operational events and changes. |
| **KPIs** | Metrics with a current value, target, unit, and interpretation direction. |
| **Operational exceptions** | Risks, issues, or deviations that need attention and resolution tracking. |

TypeScript interfaces and union types describe these records and constrain values such as task status, priority, and exception severity. TypeScript checks help during development; data received from external systems will need runtime validation when integrations are introduced.

## Technology stack

- **React** for the user interface.
- **TypeScript** for typed application and business data.
- **Vite** for development and production builds.
- **Oxlint** for linting.
- **Git and GitHub** for version control and project history.

## Development approach

This is both a software project and a structured learning project. Each milestone follows:

**Learn → Build → Test → Understand → Improve → Repeat**

Work in small steps, verify each change, and add complexity when it provides practical value.

## Local development

Requirements: a compatible Node.js installation and npm.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Run the production build:

```bash
npm run build
```

Run linting:

```bash
npm run lint
```

## Long-term direction

Potential next steps include richer filtering and sorting, date-based analysis, browser persistence, SQL and relational databases, APIs and CRM integrations, workflow automation, operational alerts, and business intelligence reporting. These are future directions, not completed features.

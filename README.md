# OpsFlow

OpsFlow is a hands-on business operations project designed to turn structured business data into operational visibility, useful performance indicators, and actionable insights.

The project is being built incrementally while learning the concepts behind each feature. The initial focus is **general business operations**: tasks, ownership, deadlines, performance metrics, and operational issues across a business.

## Project goals

- Organize operational information into a clear data model.
- Track tasks, statuses, priorities, owners, and deadlines.
- Record operational activities and changes.
- Calculate meaningful key performance indicators (KPIs).
- Highlight exceptions and work that needs attention.
- Present the information in a practical dashboard.
- Build toward more advanced analysis, integrations, and automation only when the foundations are solid.

## Current status

**Phase 1 — Functional Foundation**

- [x] Create the GitHub repository.
- [x] Scaffold a React + TypeScript + Vite application.
- [x] Start the development server and confirm the preview works.
- [x] Run a successful production build.
- [x] Preserve the project roadmap and changelog.
- [x] Commit and push the application foundation to GitHub.
- [x] Choose general business operations as the initial product focus.
- [x] Design the first version of the operational data model conceptually.
- [ ] Implement the TypeScript data model in `src/types.ts`.
- [ ] Add sample operational records and validate relationships.
- [ ] Calculate core KPIs and derive basic exception rules.
- [ ] Build the initial dashboard.

The repository currently contains the Vite starter interface. The next implementation task is to add and verify the domain types before replacing the starter UI.

See [ROADMAP.md](./ROADMAP.md) for the phased plan and [CHANGELOG.md](./CHANGELOG.md) for the development history.

## Initial data model

The first model is organized around five concepts:

| Concept | Purpose |
| --- | --- |
| **Accounts** | Customers, departments, or business units. |
| **Tasks** | Work with a status, priority, owner, and due date; an account relationship is optional. |
| **Activities** | A history of operational events and changes. |
| **KPIs** | Metrics with a current value, target, unit, and interpretation direction. |
| **Operational exceptions** | Risks, issues, or deviations that need attention and resolution tracking. |

The initial model will use TypeScript interfaces and union types to describe records and constrain values such as task status, priority, and exception severity. TypeScript checks help during development; data received from external systems will need runtime validation when integrations are introduced.

## Technology stack

- **React** for the user interface.
- **TypeScript** for typed application and business data.
- **Vite** for development and production builds.
- **Oxlint** for linting, as selected during project setup.
- **Git and GitHub** for version control and project history.

The first version will use sample data in the browser. A backend or database will be considered after the data model and business logic are understood and tested.

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

## Long-term direction

OpsFlow may grow to include stronger data analysis, filtering and sorting, SQL and relational databases, APIs and CRM integrations, workflow automation, operational alerts, and business intelligence reporting. These are future directions, not completed features.

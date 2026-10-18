# OpsFlow Roadmap

OpsFlow is a general business operations project focused on turning structured business data into operational visibility, actionable insights, and eventually automated workflows.

Development follows a practical learning cycle:

**Learn → Build → Test → Understand → Improve → Repeat**

Progress is recorded conservatively: a task is marked complete only when the work has actually been performed and verified.

---

## 🟢 Phase 1 — Functional Foundation

**Status: Deployed; final automated and responsive validation in progress**

### Step 1 — Application foundation

- [x] Create the GitHub repository.
- [x] Scaffold React + TypeScript + Vite.
- [x] Install dependencies and start the development server.
- [x] Confirm the local preview works for the starter application.
- [x] Commit and push the foundation to GitHub.
- [x] Preserve the project documentation.
- [x] Select Oxlint during project setup.
- [x] Add Aster-inspired cursor and magnetic interactions with reduced-motion and touch-device handling.

### Step 2 — Operational data model

- [x] Choose general business operations as the product focus.
- [x] Identify the five initial concepts: accounts, tasks, activities, KPIs, and operational exceptions.
- [x] Plan identifiers, statuses, priorities, dates, ownership, and optional account/task relationships.
- [x] Create `src/types.ts` with TypeScript interfaces and union types.
- [x] Use the domain types across sample records and dashboard calculations.

### Step 3 — Sample data and relationships

- [x] Add sample accounts with owners and health status.
- [x] Add tasks with different statuses, priorities, owners, and deadlines.
- [x] Add activities that reference relevant tasks or accounts.
- [x] Add sample KPIs with current values, targets, units, and direction.
- [x] Add operational exceptions with severity and resolution status.
- [x] Check sample identifiers and relationships for consistency.

### Step 4 — Business logic

- [x] Calculate task totals by status and priority.
- [x] Identify overdue tasks while excluding completed tasks.
- [x] Compare KPI values to targets using each KPI's better-direction rule.
- [x] Summarize active tasks, overdue tasks, open exceptions, critical exceptions, accounts, and on-target KPIs.
- [x] Handle completed tasks and optional account/task relationships in the sample dashboard.

### Step 5 — Initial dashboard

- [x] Replace the Vite starter interface with the OpsFlow UI.
- [x] Display operational summary metrics.
- [x] Show task status, priority, ownership, account context, and due dates.
- [x] Add task text search and status filters.
- [x] Display recent activity.
- [x] Surface open exceptions and severity.
- [x] Display KPI performance and account health.
- [x] Add responsive desktop and smaller-screen layouts.
- [x] Preserve the custom cursor and magnetic interaction layer.

### Step 6 — MVP validation

- [x] Update the README, roadmap, and changelog to describe the implementation.
- [x] Deploy the functional dashboard to GitHub Pages.
- [x] Add browser-local persistence for editable task and exception statuses.
- [x] Add a reset action for restoring the sample workspace.
- [ ] Confirm CI build/lint checks for the persistent-workflows branch.
- [ ] Review status changes and persistence in desktop/mobile previews.

---

## 🔵 Phase 2 — Data & Business Logic

**Status: In progress — Supabase Auth and shared task/exception reads/writes implemented; cross-user validation pending**

- [x] Persist task and exception status changes in browser local storage.
- [x] Allow tasks to be moved between to do, in progress, blocked, and completed.
- [x] Allow exceptions to be opened, investigated, or resolved.
- [x] Add a reset action to restore the demo workspace.
- [ ] Add richer filtering and sorting.
- [ ] Add date-based analysis and trend views.
- [ ] Expand KPI calculations and comparisons.
- [ ] Add configurable business rules.
- [ ] Improve exception detection and prioritization.
- [ ] Add operational summaries.
- [x] Add browser-local persistence as a learning step before database integration.
- [x] Design PostgreSQL tables for workspaces, members, tasks, and operational exceptions.
- [x] Add row-level security policies for authenticated workspace access.
- [x] Document Supabase setup, client configuration, and credential safety.
- [x] Create/configure the Supabase project and apply the migration.
- [x] Add sign-in/sign-out and authenticated workspace selection.
- [x] Connect task and exception reads/writes to the shared database.
- [ ] Verify workspace isolation and shared updates in two browser sessions.
- [ ] Add an explicit, previewable import path if demo data should be moved into a shared workspace.

---

## 🟣 Phase 3 — SQL & Data Modeling

**Status: Started early as part of shared-storage design**

- [ ] Introduce relational data concepts.
- [x] Design an initial database schema based on the tested domain model.
- [ ] Learn and implement SQL queries.
- [ ] Create reporting queries.
- [ ] Connect application data to a database.
- [ ] Separate operational data from reporting logic.
- [ ] Explore basic ETL workflows.

---

## 🟡 Phase 4 — APIs & Integrations

**Status: Planned**

- [ ] Introduce REST APIs.
- [ ] Connect external business data.
- [ ] Explore CRM integration.
- [ ] Synchronize operational data.
- [ ] Handle API errors and loading states.
- [ ] Explore webhook-based events.

---

## 🟠 Phase 5 — Automation

**Status: Planned**

- [ ] Define automated operational workflows.
- [ ] Create trigger-based actions.
- [ ] Automate exception handling.
- [ ] Create operational alerts.
- [ ] Explore Power Automate.
- [ ] Explore Python-based automation.

---

## 🔴 Phase 6 — Business Intelligence

**Status: Future**

- [ ] Build advanced KPI reporting.
- [ ] Create richer operational dashboards.
- [ ] Add trend analysis and data visualization.
- [ ] Explore Power BI.
- [ ] Create executive reporting.
- [ ] Connect BI reporting to operational data.

---

## Long-term vision

OpsFlow should evolve from a small operational dashboard into a practical operations intelligence system.

```text
Business Data
     ↓
Data Modeling
     ↓
Business Logic & KPI Calculation
     ↓
Operational Visibility
     ↓
Exception Detection
     ↓
Action
     ↓
Automation
     ↓
Business Intelligence
```

The system should progressively move from **showing what is happening** toward helping identify **what requires attention and what can be improved or automated**.

## Guiding principle

> **Start with the data. Turn it into information. Turn information into action.**

Build the minimum functional version first, verify it, and introduce complexity only when it provides practical value.

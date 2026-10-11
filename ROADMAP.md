# OpsFlow Roadmap

OpsFlow is a general business operations project focused on turning structured business data into operational visibility, actionable insights, and eventually automated workflows.

Development follows a practical learning cycle:

**Learn → Build → Test → Understand → Improve → Repeat**

Progress is recorded conservatively: a task is marked complete only when the work has actually been performed and verified.

---

## 🟢 Phase 1 — Functional Foundation

**Status: In progress**

### Step 1 — Application foundation

- [x] Create the GitHub repository.
- [x] Scaffold React + TypeScript + Vite.
- [x] Install dependencies and start the development server.
- [x] Confirm the local preview works.
- [x] Run `npm run build` successfully.
- [x] Commit and push the foundation to GitHub.
- [x] Preserve the project documentation.
- [x] Select Oxlint during project setup.

### Step 2 — Operational data model

**Current position: Step 2A — Define the model**

- [x] Choose general business operations as the product focus.
- [x] Identify the five initial concepts: accounts, tasks, activities, KPIs, and operational exceptions.
- [x] Plan identifiers, statuses, priorities, dates, ownership, and optional account/task relationships.
- [ ] Create `src/types.ts` with TypeScript interfaces and union types.
- [ ] Run a production build after adding the types.
- [ ] Review the model and explain the role of each type.

### Step 3 — Sample data and relationships

- [ ] Add realistic sample accounts.
- [ ] Add tasks with different statuses, priorities, owners, and deadlines.
- [ ] Add activities that reference relevant tasks or accounts.
- [ ] Add sample KPIs with current values and targets.
- [ ] Add operational exceptions with severity and resolution status.
- [ ] Check that IDs and relationships are consistent.

### Step 4 — Business logic

- [ ] Calculate task totals by status and priority.
- [ ] Identify overdue tasks using due dates and task status.
- [ ] Calculate initial KPI performance and target comparisons.
- [ ] Define explicit rules for creating and resolving exceptions.
- [ ] Test edge cases so completed tasks and missing optional relationships are handled correctly.

### Step 5 — Initial dashboard

- [ ] Replace the Vite starter interface with the OpsFlow UI.
- [ ] Display operational summary metrics.
- [ ] Show task status and priority.
- [ ] Display recent activity.
- [ ] Surface open and high-severity exceptions.
- [ ] Make the layout usable on desktop and smaller screens.
- [ ] Test the dashboard against the sample data.

### Step 6 — MVP validation

- [ ] Review the app for correctness and usability.
- [ ] Run the production build.
- [ ] Verify the key calculations against known sample cases.
- [ ] Update documentation and changelog.
- [ ] Commit and push the completed milestone.

---

## 🔵 Phase 2 — Data & Business Logic

**Status: Planned**

- [ ] Add filtering and sorting.
- [ ] Add date-based analysis.
- [ ] Expand KPI calculations and comparisons.
- [ ] Add configurable business rules.
- [ ] Improve exception detection and prioritization.
- [ ] Add operational summaries.
- [ ] Consider browser persistence after the data flow is understood.

---

## 🟣 Phase 3 — SQL & Data Modeling

**Status: Planned**

- [ ] Introduce relational data concepts.
- [ ] Design a database schema based on the tested domain model.
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

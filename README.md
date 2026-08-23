# OpsFlow

**Operations intelligence and workflow management dashboard**

OpsFlow is a full-stack operations management application designed to make operational workload visible, measurable, and actionable. It combines a PostgreSQL data layer, FastAPI backend services, and a React/TypeScript dashboard to monitor requests, workload, SLA performance, and escalations.

## What it demonstrates

- Operations request management
- Request search, filtering, pagination, and inspection
- Priority and status visibility
- Team workload analytics
- Request-type performance analytics
- SLA target and breach tracking
- Escalation monitoring
- Resolution-time reporting
- Dashboard metrics backed by live API data
- Responsive command-center style UI

## Architecture

```text
React + TypeScript + Vite + Tailwind CSS
                 |
                 v
              FastAPI
                 |
                 v
            PostgreSQL 16
```

The frontend consumes the backend through HTTP APIs. PostgreSQL is containerized with Docker Compose and initialized from the `database/` directory.

## Tech stack

### Frontend

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Recharts

### Backend

- Python
- FastAPI
- REST API architecture

### Data

- PostgreSQL 16
- Docker / Docker Compose

## Key API capabilities

The dashboard currently consumes operational endpoints including:

- `/metrics/overview`
- `/metrics/workload`
- `/metrics/request-types`
- `/requests`
- `/requests/{request_id}`

Request detail data includes assignment, team, priority, status, resolution time, event history, SLA state, and escalation information.

## Example operational workflow

A request can move through a lifecycle such as:

`New → Assigned → In Progress → Resolved → Closed`

The system records status events and can evaluate resolution performance against the applicable SLA. Critical requests can also be surfaced through escalation data.

## Running locally

### 1. Start PostgreSQL

From the project root:

```powershell
docker compose up -d
```

PostgreSQL is exposed locally on port `5433`.

### 2. Start the FastAPI backend

Activate the Python virtual environment and start the API using the project's backend entry point.

The dashboard expects the API at:

```text
http://127.0.0.1:8000
```

### 3. Start the dashboard

```powershell
cd dashboard
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/
```

### 4. Production build

```powershell
npm run build
```

The production build is generated in `dashboard/dist/`.

## Project structure

```text
opsflow/
├── database/              # PostgreSQL initialization / seed SQL
├── dashboard/             # React + TypeScript frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.*
├── docker-compose.yml     # PostgreSQL container configuration
└── backend files           # FastAPI application and API services
```

## Why this project matters

OpsFlow is intentionally built around realistic operations problems rather than a generic CRUD interface. The project models the kinds of information an operations team needs to manage service delivery: workload, ownership, priority, request lifecycle, SLA compliance, resolution speed, and escalation risk.

It is designed as a portfolio project demonstrating practical experience across **Business Operations, Operations Analytics, CRM/workflow thinking, process design, reporting, and full-stack application development**.

## Status

**MVP functional.** The core data pipeline, API, dashboard, request workspace, metrics, SLA tracking, and escalation visibility are operational. Further workflow controls can be added incrementally without changing the core architecture.

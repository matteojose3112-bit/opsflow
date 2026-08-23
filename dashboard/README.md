# OpsFlow Dashboard

The frontend command center for **OpsFlow**, an operations intelligence and workflow management platform.

## Highlights

- Live operational overview backed by the OpsFlow API
- Request volume, open workload, critical requests, resolution time, and SLA breach rate
- Team workload and SLA pressure analysis
- Request-type performance analysis
- Operational health indicators
- Request explorer with search, status, priority filters, and pagination
- Responsive dark command-center UI

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4
- Recharts

## Local development

From this directory:

```powershell
npm install
npm run dev
```

The dashboard expects the API at:

`http://127.0.0.1:8000`

## Production build

```powershell
npm run build
```

## Deployment

The Vite base path is configured for the repository's GitHub Pages deployment at `/opsflow/`.

## Project role

This dashboard is the presentation and analysis layer of OpsFlow. It turns operational data from PostgreSQL/FastAPI services into a usable workspace for monitoring workload, service performance, SLA compliance, and operational risk.

import type { OpsFlowData } from '../types';

export const sampleData: OpsFlowData = {
  accounts: [
    { id: 'acc-001', name: 'Northstar Retail', industry: 'Retail', owner: 'Maya Chen', health: 'at_risk', updatedAt: '2026-10-18T08:40:00' },
    { id: 'acc-002', name: 'Meridian Health', industry: 'Healthcare', owner: 'Jordan Lee', health: 'healthy', updatedAt: '2026-10-17T16:10:00' },
    { id: 'acc-003', name: 'Fieldwork Logistics', industry: 'Logistics', owner: 'Alex Morgan', health: 'critical', updatedAt: '2026-10-18T09:15:00' },
    { id: 'acc-004', name: 'Juniper Finance', industry: 'Financial services', owner: 'Sam Rivera', health: 'healthy', updatedAt: '2026-10-16T11:30:00' },
  ],
  tasks: [
    { id: 'tsk-101', title: 'Resolve delayed inventory sync', description: 'Reconcile the overnight inventory feed and confirm counts.', status: 'in_progress', priority: 'urgent', owner: 'Maya Chen', dueDate: '2026-10-18', accountId: 'acc-001', createdAt: '2026-10-14' },
    { id: 'tsk-102', title: 'Review weekly service metrics', description: 'Validate service-level data before the weekly review.', status: 'todo', priority: 'high', owner: 'Jordan Lee', dueDate: '2026-10-19', accountId: 'acc-002', createdAt: '2026-10-16' },
    { id: 'tsk-103', title: 'Confirm carrier handoff', description: 'Get confirmation for the outstanding carrier transfer.', status: 'blocked', priority: 'urgent', owner: 'Alex Morgan', dueDate: '2026-10-17', accountId: 'acc-003', createdAt: '2026-10-12' },
    { id: 'tsk-104', title: 'Prepare month-end reconciliation', description: 'Compile final figures and review variance notes.', status: 'in_progress', priority: 'medium', owner: 'Sam Rivera', dueDate: '2026-10-22', accountId: 'acc-004', createdAt: '2026-10-15' },
    { id: 'tsk-105', title: 'Publish updated response playbook', description: 'Share the approved service response guide with the team.', status: 'done', priority: 'low', owner: 'Jordan Lee', dueDate: '2026-10-16', accountId: 'acc-002', createdAt: '2026-10-10' },
    { id: 'tsk-106', title: 'Audit supplier exception queue', description: 'Check aged supplier exceptions and assign next actions.', status: 'todo', priority: 'high', owner: 'Maya Chen', dueDate: '2026-10-20', accountId: 'acc-001', createdAt: '2026-10-17' },
    { id: 'tsk-107', title: 'Update dispatch coverage plan', description: 'Confirm weekend staffing coverage across regions.', status: 'in_progress', priority: 'medium', owner: 'Alex Morgan', dueDate: '2026-10-21', accountId: 'acc-003', createdAt: '2026-10-16' },
  ],
  activities: [
    { id: 'act-201', title: 'Task moved to in progress', detail: 'Resolve delayed inventory sync', actor: 'Maya Chen', occurredAt: '2026-10-18T09:42:00', taskId: 'tsk-101', accountId: 'acc-001' },
    { id: 'act-202', title: 'Critical exception flagged', detail: 'Carrier handoff is still unconfirmed', actor: 'OpsFlow rules', occurredAt: '2026-10-18T09:15:00', taskId: 'tsk-103', accountId: 'acc-003' },
    { id: 'act-203', title: 'Task completed', detail: 'Publish updated response playbook', actor: 'Jordan Lee', occurredAt: '2026-10-17T16:24:00', taskId: 'tsk-105', accountId: 'acc-002' },
    { id: 'act-204', title: 'Account health updated', detail: 'Fieldwork Logistics marked critical', actor: 'Alex Morgan', occurredAt: '2026-10-17T14:05:00', accountId: 'acc-003' },
    { id: 'act-205', title: 'Reconciliation started', detail: 'Month-end close preparation', actor: 'Sam Rivera', occurredAt: '2026-10-17T11:30:00', taskId: 'tsk-104', accountId: 'acc-004' },
  ],
  kpis: [
    { id: 'kpi-01', name: 'On-time completion', value: 86, target: 92, unit: '%', direction: 'higher_is_better', change: 4.2, changeLabel: 'vs. last week' },
    { id: 'kpi-02', name: 'Open exceptions', value: 8, target: 5, unit: 'count', direction: 'lower_is_better', change: -2, changeLabel: 'vs. last week' },
    { id: 'kpi-03', name: 'Avg. resolution time', value: 14, target: 12, unit: 'hours', direction: 'lower_is_better', change: -1.5, changeLabel: 'vs. last week' },
    { id: 'kpi-04', name: 'SLA attainment', value: 94.6, target: 95, unit: '%', direction: 'higher_is_better', change: 1.8, changeLabel: 'vs. last week' },
  ],
  exceptions: [
    { id: 'exc-301', title: 'Carrier handoff unconfirmed', description: 'A shipment transfer is past its expected confirmation window.', severity: 'critical', status: 'open', owner: 'Alex Morgan', createdAt: '2026-10-17T13:20:00', dueDate: '2026-10-17', accountId: 'acc-003', taskId: 'tsk-103' },
    { id: 'exc-302', title: 'Inventory feed is delayed', description: 'Latest inventory sync did not complete within the normal window.', severity: 'high', status: 'investigating', owner: 'Maya Chen', createdAt: '2026-10-18T07:55:00', dueDate: '2026-10-18', accountId: 'acc-001', taskId: 'tsk-101' },
    { id: 'exc-303', title: 'Service response variance', description: 'Response time exceeded the team threshold in one queue.', severity: 'medium', status: 'open', owner: 'Jordan Lee', createdAt: '2026-10-16T10:10:00', dueDate: '2026-10-20', accountId: 'acc-002' },
    { id: 'exc-304', title: 'Supplier invoice mismatch', description: 'Invoice total differs from the approved purchase order.', severity: 'low', status: 'resolved', owner: 'Sam Rivera', createdAt: '2026-10-15T08:40:00', accountId: 'acc-004' },
  ],
};

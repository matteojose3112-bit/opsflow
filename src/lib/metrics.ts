import type { Kpi, OpsFlowData, Task, TaskPriority, TaskStatus } from '../types';

export function isOverdue(task: Task, today = new Date()): boolean {
  if (task.status === 'done') return false;
  const due = new Date(`${task.dueDate}T23:59:59`);
  return due.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
}

export function getTaskCounts(tasks: Task[]) {
  const statuses: TaskStatus[] = ['todo', 'in_progress', 'blocked', 'done'];
  const priorities: TaskPriority[] = ['urgent', 'high', 'medium', 'low'];
  return {
    byStatus: Object.fromEntries(statuses.map((status) => [status, tasks.filter((task) => task.status === status).length])) as Record<TaskStatus, number>,
    byPriority: Object.fromEntries(priorities.map((priority) => [priority, tasks.filter((task) => task.priority === priority).length])) as Record<TaskPriority, number>,
    overdue: tasks.filter((task) => isOverdue(task)).length,
    completed: tasks.filter((task) => task.status === 'done').length,
  };
}

export function isKpiOnTarget(kpi: Kpi): boolean {
  return kpi.direction === 'higher_is_better' ? kpi.value >= kpi.target : kpi.value <= kpi.target;
}

export function getDashboardSummary(data: OpsFlowData) {
  const taskCounts = getTaskCounts(data.tasks);
  const openExceptions = data.exceptions.filter((item) => item.status !== 'resolved');
  return {
    totalTasks: data.tasks.length,
    completedTasks: taskCounts.completed,
    overdueTasks: taskCounts.overdue,
    activeTasks: data.tasks.filter((task) => task.status === 'in_progress').length,
    openExceptions: openExceptions.length,
    criticalExceptions: openExceptions.filter((item) => item.severity === 'critical').length,
    accountCount: data.accounts.length,
    kpisOnTarget: data.kpis.filter(isKpiOnTarget).length,
    taskCounts,
  };
}

export function formatKpiValue(kpi: Kpi): string {
  if (kpi.unit === '%') return `${kpi.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
  if (kpi.unit === 'hours') return `${kpi.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}h`;
  if (kpi.unit === 'days') return `${kpi.value.toLocaleString(undefined, { maximumFractionDigits: 1 })}d`;
  if (kpi.unit === 'currency') return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(kpi.value);
  return kpi.value.toLocaleString();
}

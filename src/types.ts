export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type ExceptionSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ExceptionStatus = 'open' | 'investigating' | 'resolved';
export type KpiDirection = 'higher_is_better' | 'lower_is_better';

export interface Account {
  id: string;
  name: string;
  industry: string;
  owner: string;
  health: 'healthy' | 'at_risk' | 'critical';
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  owner: string;
  dueDate: string;
  accountId?: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  title: string;
  detail: string;
  actor: string;
  occurredAt: string;
  taskId?: string;
  accountId?: string;
}

export interface Kpi {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: '%' | 'hours' | 'count' | 'days' | 'currency';
  direction: KpiDirection;
  change: number;
  changeLabel: string;
}

export interface OperationalException {
  id: string;
  title: string;
  description: string;
  severity: ExceptionSeverity;
  status: ExceptionStatus;
  owner: string;
  createdAt: string;
  dueDate?: string;
  accountId?: string;
  taskId?: string;
}

export interface OpsFlowData {
  accounts: Account[];
  tasks: Task[];
  activities: Activity[];
  kpis: Kpi[];
  exceptions: OperationalException[];
}

import { useEffect, useMemo, useState } from 'react';
import MouseEffects from './components/layout/MouseEffects';
import { sampleData } from './data/sampleData';
import { formatKpiValue, getDashboardSummary, isKpiOnTarget, isOverdue } from './lib/metrics';
import type { OperationalException, Task, TaskPriority, TaskStatus } from './types';
import './App.css';

const priorityLabels: Record<TaskPriority, string> = {
  urgent: 'Urgent',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};
const statusOrder: TaskStatus[] = ['in_progress', 'todo', 'blocked', 'done'];
const storageKey = 'opsflow-workspace-v1';

function loadWorkspace(): { tasks: Task[]; exceptions: OperationalException[] } {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (raw) {
      const saved: unknown = JSON.parse(raw);
      if (saved && typeof saved === 'object' && 'tasks' in saved && 'exceptions' in saved) {
        const workspace = saved as { tasks: unknown; exceptions: unknown };
        const validTasks = Array.isArray(workspace.tasks) && workspace.tasks.every((item) =>
          item && typeof item.id === 'string' && typeof item.title === 'string'
          && ['todo', 'in_progress', 'blocked', 'done'].includes(item.status),
        );
        const validExceptions = Array.isArray(workspace.exceptions) && workspace.exceptions.every((item) =>
          item && typeof item.id === 'string' && typeof item.title === 'string'
          && ['open', 'investigating', 'resolved'].includes(item.status),
        );
        if (validTasks && validExceptions) {
          return { tasks: workspace.tasks as Task[], exceptions: workspace.exceptions as OperationalException[] };
        }
      }
    }
  } catch {
    // If storage is unavailable or invalid, fall back to the built-in demo workspace.
  }
  return { tasks: sampleData.tasks, exceptions: sampleData.exceptions };
}

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(value: string) {
  const date = new Date(value.includes('T') ? value : `${value}T12:00:00`);
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date);
}

function relativeTime(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function TaskRow({ task, onStatusChange }: { task: Task; onStatusChange: (taskId: string, status: TaskStatus) => void }) {
  const account = sampleData.accounts.find((item) => item.id === task.accountId);
  return (
    <article className="task-row">
      <span className={`task-status-dot ${task.status}`} aria-hidden="true" />
      <div className="task-main">
        <div className="task-title-line">
          <strong>{task.title}</strong>
          <select className={`task-status-select ${task.status}`} value={task.status} aria-label={`Update status for ${task.title}`} onChange={(event) => onStatusChange(task.id, event.target.value as TaskStatus)}>
            <option value="todo">To do</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="done">Completed</option>
          </select>
          {isOverdue(task) && <span className="overdue-label">Overdue</span>}
        </div>
        <p>{account?.name ?? 'Internal operations'} <span className="muted-separator">/</span> {task.owner}</p>
      </div>
      <span className={`priority-pill priority-${task.priority}`}>{priorityLabels[task.priority]}</span>
      <span className="task-due">{formatDate(task.dueDate)}</span>
    </article>
  );
}

function App() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
  const [activeNav, setActiveNav] = useState('Overview');
  const [tasks, setTasks] = useState<Task[]>(() => loadWorkspace().tasks);
  const [exceptions, setExceptions] = useState<OperationalException[]>(() => loadWorkspace().exceptions);
  useEffect(() => {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify({ tasks, exceptions }));
    } catch {
      // The dashboard remains usable if browser storage is disabled or full.
    }
  }, [tasks, exceptions]);
  const summary = useMemo(() => getDashboardSummary({ ...sampleData, tasks, exceptions }), [tasks, exceptions]);
  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((current) => current.map((task) => task.id === taskId ? { ...task, status } : task));
  };
  const updateExceptionStatus = (exceptionId: string, status: OperationalException['status']) => {
    setExceptions((current) => current.map((item) => item.id === exceptionId ? { ...item, status } : item));
  };
  const resetWorkspace = () => {
    setTasks(sampleData.tasks);
    setExceptions(sampleData.exceptions);
    setQuery('');
    setStatusFilter('all');
  };
  const visibleTasks = useMemo(() => tasks
    .filter((task) => statusFilter === 'all' || task.status === statusFilter)
    .filter((task) => `${task.title} ${task.owner} ${sampleData.accounts.find((account) => account.id === task.accountId)?.name ?? ''}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(isOverdue(b)) - Number(isOverdue(a)) || statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)), [query, statusFilter, tasks]);

  const today = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <>
      <MouseEffects />
      <div className="app-shell">
        <aside className="sidebar">
          <a className="brand" href="#overview" onClick={() => setActiveNav('Overview')} aria-label="OpsFlow home">
            <span className="brand-mark"><span /></span>
            <span>ops<span className="brand-light">flow</span><small>OPERATIONS OS</small></span>
          </a>
          <div className="workspace-label">WORKSPACE</div>
          <button className="workspace-switcher" type="button">
            <span className="workspace-avatar">N</span>
            <span className="workspace-copy"><strong>Northstar Group</strong><small>Business operations</small></span>
            <span className="switcher-chevron">⌄</span>
          </button>
          <div className="nav-label">WORKSPACE</div>
          <nav className="primary-nav" aria-label="Main navigation">
            {[
              ['Overview', '◫'],
              ['Tasks', '✓'],
              ['Accounts', '▤'],
              ['Activity', '↗'],
              ['Exceptions', '△'],
              ['Performance', '⌁'],
            ].map(([label, glyph]) => (
              <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} type="button" onClick={() => { setActiveNav(label); if (label === 'Tasks') document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' }); if (label === 'Exceptions') document.getElementById('exceptions')?.scrollIntoView({ behavior: 'smooth' }); if (label === 'Activity') document.getElementById('activity')?.scrollIntoView({ behavior: 'smooth' }); if (label === 'Performance') document.getElementById('performance')?.scrollIntoView({ behavior: 'smooth' }); if (label === 'Accounts') document.getElementById('accounts')?.scrollIntoView({ behavior: 'smooth' }); if (label === 'Overview') window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                <span className="nav-glyph">{glyph}</span><span>{label}</span>
                {label === 'Exceptions' && <span className="nav-count">{summary.openExceptions}</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-bottom">
            <div className="sidebar-tip"><span className="tip-spark">✳</span><strong>Stay ahead of the work.</strong><p>Your operations at a glance, so nothing important slips through.</p></div>
            <button className="profile-button" type="button"><span className="profile-avatar">MC</span><span><strong>Maya Chen</strong><small>Operations lead</small></span><span className="profile-menu">•••</span></button>
          </div>
        </aside>

        <main className="main-area" id="overview">
          <header className="topbar">
            <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeNav}</strong></div>
            <div className="topbar-actions"><span className="system-status"><i /> All systems operational</span><button className="icon-button notification-button" type="button" aria-label="Notifications">♧<i /></button><span className="topbar-avatar">MC</span></div>
          </header>

          <div className="page-content">
            <section className="welcome-row">
              <div><div className="eyebrow">{today.toUpperCase()} <span>·</span> WEEK 42</div><h1>Good afternoon, Maya <span className="wave">✳</span></h1><p className="page-subtitle">Here’s what’s happening across your operations today.</p></div>
              <div className="welcome-actions"><button className="secondary-button" type="button" onClick={resetWorkspace}>Reset demo data</button><button className="primary-button" type="button" onClick={() => { setStatusFilter('all'); document.getElementById('tasks')?.scrollIntoView({ behavior: 'smooth' }); }}><span>＋</span> Review priorities</button></div>
            </section>

            <section className="metric-grid" aria-label="Operational summary">
              <article className="metric-card"><div className="metric-top"><span>Active tasks</span><span className="metric-icon purple">↗</span></div><div className="metric-value">{summary.activeTasks}<span className="metric-total"> / {summary.totalTasks}</span></div><div className="metric-foot"><span className="trend positive">↑ 12%</span><span>vs. last week</span><div className="mini-bars">{[4,6,5,8,6,10,8,12,9,13,11,15].map((h,i)=><i key={i} style={{height:`${h}px`}} />)}</div></div></article>
              <article className="metric-card"><div className="metric-top"><span>Overdue tasks</span><span className="metric-icon amber">◷</span></div><div className="metric-value">{summary.overdueTasks.toString().padStart(2,'0')}</div><div className="metric-foot"><span className={summary.overdueTasks ? 'trend negative' : 'trend positive'}>{summary.overdueTasks ? 'Needs attention' : 'All clear'}</span><span>past due date</span></div><div className="metric-progress"><i className="progress-amber" style={{width:`${Math.min(100, summary.overdueTasks / Math.max(1,summary.totalTasks)*100)}%`}} /></div></article>
              <article className="metric-card"><div className="metric-top"><span>Open exceptions</span><span className="metric-icon rose">△</span></div><div className="metric-value">{summary.openExceptions.toString().padStart(2,'0')}</div><div className="metric-foot"><span className="trend negative">{summary.criticalExceptions} critical</span><span>requiring attention</span></div><div className="exception-segments"><i /><i /><i /><i /><i /><i /><i /><i /></div></article>
              <article className="metric-card"><div className="metric-top"><span>Accounts tracked</span><span className="metric-icon blue">▤</span></div><div className="metric-value">{summary.accountCount.toString().padStart(2,'0')}</div><div className="metric-foot"><span className="trend neutral">{sampleData.accounts.filter(a=>a.health==='healthy').length} healthy</span><span>active accounts</span></div><div className="avatar-stack">{sampleData.accounts.map((account,i)=><span key={account.id} className={`stack-avatar stack-${i}`} title={account.name}>{initials(account.name)}</span>)}<span className="stack-more">+0</span></div></article>
            </section>

            <section className="content-grid">
              <article className="panel tasks-panel" id="tasks">
                <div className="panel-heading"><div><h2>Task overview</h2><p>Keep the team moving on what matters.</p></div><button className="text-button" type="button" onClick={()=>setStatusFilter('all')}>View all tasks <span>↗</span></button></div>
                <div className="task-filters" role="group" aria-label="Filter tasks">
                  {([['all','All tasks'],['in_progress','In progress'],['todo','To do'],['blocked','Blocked']] as const).map(([value,label])=><button key={value} className={statusFilter===value?'selected':''} type="button" onClick={()=>setStatusFilter(value)}>{label}{value==='all'&&<span>{summary.totalTasks}</span>}</button>)}
                </div>
                <label className="search-field"><span>⌕</span><input value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Search tasks or owners..." aria-label="Search tasks or owners" /><kbd>⌘ K</kbd></label>
                <div className="task-list">{visibleTasks.map(task=><TaskRow key={task.id} task={task} onStatusChange={updateTaskStatus} />)}{visibleTasks.length===0&&<div className="empty-state">No tasks match that search. Try another keyword.</div>}</div>
                <div className="panel-footer"><span>Showing {visibleTasks.length} of {tasks.length} tasks</span><div className="task-legend"><i className="legend-done" /> Completed <i className="legend-progress" /> In progress <i className="legend-blocked" /> Blocked</div></div>
              </article>

              <article className="panel performance-panel" id="performance">
                <div className="panel-heading"><div><h2>Performance snapshot</h2><p>Progress against operational targets.</p></div><button className="more-button" type="button" aria-label="More performance options">•••</button></div>
                <div className="performance-score"><div className="score-ring"><svg viewBox="0 0 100 100" role="img" aria-label={`${Math.round(summary.kpisOnTarget/sampleData.kpis.length*100)} percent of KPIs on target`}><circle className="ring-track" cx="50" cy="50" r="41" /><circle className="ring-value" cx="50" cy="50" r="41" strokeDasharray={`${2*Math.PI*41*summary.kpisOnTarget/sampleData.kpis.length} ${2*Math.PI*41}`} /></svg><div><strong>{Math.round(summary.kpisOnTarget/sampleData.kpis.length*100)}<small>%</small></strong><span>on target</span></div></div><div className="score-copy"><strong>{summary.kpisOnTarget} of {sampleData.kpis.length} KPIs on track</strong><p>Keep focus on the metrics just below target.</p><span className="score-trend">↗ Trending in the right direction</span></div></div>
                <div className="kpi-list">{sampleData.kpis.map(kpi=><div className="kpi-row" key={kpi.id}><div className="kpi-label"><span>{kpi.name}</span><strong>{formatKpiValue(kpi)}</strong></div><div className="kpi-track"><i className={isKpiOnTarget(kpi)?'kpi-good':'kpi-warn'} style={{width:`${Math.min(100,Math.max(0,kpi.value/Math.max(kpi.target,0.01)*100))}%`}} /></div><div className="kpi-meta"><span>Target {formatKpiValue({...kpi,value:kpi.target})}</span><span className={kpi.change>=0?'change-positive':'change-negative'}>{kpi.change>0?'+':''}{kpi.change}{kpi.unit==='%'?'pp':kpi.unit==='hours'?'h':''}</span></div></div>)}</div>
                <div className="performance-footer"><span>Last updated just now</span><span className="live-dot" /> Sample data
                </div>
              </article>
            </section>

            <section className="bottom-grid">
              <article className="panel exceptions-panel" id="exceptions">
                <div className="panel-heading"><div><div className="heading-with-count"><h2>Needs attention</h2><span className="heading-count">{summary.openExceptions}</span></div><p>Exceptions that could impact delivery.</p></div><button className="text-button" type="button" onClick={()=>setActiveNav('Exceptions')}>All exceptions <span>↗</span></button></div>
                <div className="exception-list">{exceptions.filter(item=>item.status!=='resolved').sort((a,b)=>({critical:0,high:1,medium:2,low:3}[a.severity]-{critical:0,high:1,medium:2,low:3}[b.severity])).slice(0,3).map(item=><div className="exception-row" key={item.id}><span className={`severity-icon severity-${item.severity}`}>{item.severity==='critical'?'!':item.severity==='high'?'△':'↗'}</span><div className="exception-copy"><strong>{item.title}</strong><p>{item.description}</p><span className="exception-owner">Owner: {item.owner}</span></div><span className={`severity-pill severity-text-${item.severity}`}>{item.severity}</span><select className="exception-status-select" value={item.status} aria-label={`Update status for ${item.title}`} onChange={(event) => updateExceptionStatus(item.id, event.target.value as OperationalException['status'])}><option value="open">Open</option><option value="investigating">Investigating</option><option value="resolved">Resolved</option></select></div>)}</div>
              </article>

              <article className="panel activity-panel" id="activity">
                <div className="panel-heading"><div><h2>Recent activity</h2><p>A live trail of operational changes.</p></div><button className="more-button" type="button" aria-label="More activity options">•••</button></div>
                <div className="activity-list">{sampleData.activities.slice(0,4).map((activity,index)=><div className="activity-row" key={activity.id}><span className={`activity-marker activity-marker-${index}`}>{index===0?'↗':index===1?'!':index===2?'✓':'◉'}</span><div className="activity-copy"><strong>{activity.title}</strong><p>{activity.detail}</p><span>{activity.actor} <i>·</i> {relativeTime(activity.occurredAt)}</span></div></div>)}</div>
              </article>
            </section>

            <section className="accounts-section" id="accounts"><div className="accounts-heading"><div><h2>Account health</h2><p>A quick read on the teams and customers you support.</p></div><span className="accounts-total">{sampleData.accounts.length} accounts</span></div><div className="account-grid">{sampleData.accounts.map(account=><article className="account-card" key={account.id}><div className="account-card-top"><span className="account-monogram">{initials(account.name)}</span><span className={`health-pill health-${account.health}`}><i />{account.health.replace('_',' ')}</span></div><strong>{account.name}</strong><span className="account-industry">{account.industry}</span><div className="account-card-footer"><span>{account.owner}</span><span>Updated {formatDate(account.updatedAt)}</span></div></article>)}</div></section>
            <footer className="app-footer"><span><span className="footer-mark">◈</span> OpsFlow <span className="footer-divider">/</span> Operational clarity, every day.</span><span>PHASE 1 · FUNCTIONAL FOUNDATION <i /></span></footer>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import App from './App';
import type { OperationalException, Task, TaskStatus } from './types';
import './AuthApp.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;
const sessionKey = 'opsflow-supabase-session-v1';

type User = { id: string; email?: string };
type Session = { access_token: string; refresh_token: string; expires_at?: number; expires_in?: number; user: User };
type Workspace = { id: string; name: string; role: string };
type ApiError = { message?: string; msg?: string; error_description?: string };

function getError(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object') {
    const error = payload as ApiError;
    return error.message || error.msg || error.error_description || fallback;
  }
  return fallback;
}

async function authRequest(path: string, body: unknown): Promise<Session> {
  const response = await fetch(supabaseUrl + '/auth/v1/' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: publishableKey! },
    body: JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(getError(payload, 'Authentication request failed.'));
  return payload as Session;
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(sessionKey);
    return raw ? JSON.parse(raw) as Session : null;
  } catch { return null; }
}
function saveSession(session: Session | null) {
  if (session) localStorage.setItem(sessionKey, JSON.stringify(session));
  else localStorage.removeItem(sessionKey);
}

async function request<T>(session: Session, path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('apikey', publishableKey!);
  headers.set('Authorization', 'Bearer ' + session.access_token);
  if (options.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(supabaseUrl + '/rest/v1/' + path, { ...options, headers });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(getError(payload, 'Database request failed (' + response.status + ').'));
  return payload as T;
}

function toTask(row: Record<string, unknown>): Task {
  return {
    id: String(row.id), title: String(row.title), description: String(row.description ?? ''),
    status: row.status as Task['status'], priority: row.priority as Task['priority'],
    owner: String(row.owner), dueDate: String(row.due_date), accountId: row.account_id ? String(row.account_id) : undefined,
    createdAt: String(row.created_at),
  };
}
function toException(row: Record<string, unknown>): OperationalException {
  return {
    id: String(row.id), title: String(row.title), description: String(row.description ?? ''),
    severity: row.severity as OperationalException['severity'], status: row.status as OperationalException['status'],
    owner: String(row.owner), createdAt: String(row.created_at), dueDate: row.due_date ? String(row.due_date) : undefined,
    accountId: row.account_id ? String(row.account_id) : undefined, taskId: row.task_id ? String(row.task_id) : undefined,
  };
}

export default function AuthApp() {
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [exceptions, setExceptions] = useState<OperationalException[]>([]);
  const [loadingWorkspace, setLoadingWorkspace] = useState(false);

  const signOut = useCallback(async () => {
    if (session && supabaseUrl && publishableKey) {
      try {
        await fetch(supabaseUrl + '/auth/v1/logout', { method: 'POST', headers: { apikey: publishableKey, Authorization: 'Bearer ' + session.access_token } });
      } catch { /* Clear local session even if the network is unavailable. */ }
    }
    saveSession(null); setSession(null); setWorkspace(null); setTasks([]); setExceptions([]);
  }, [session]);

  const refreshSession = useCallback(async (current: Session) => {
    if (!current.expires_at || current.expires_at > Math.floor(Date.now() / 1000) + 60) return current;
    const refreshed = await authRequest('token?grant_type=refresh_token', { refresh_token: current.refresh_token });
    refreshed.expires_at = Math.floor(Date.now() / 1000) + (refreshed.expires_in ?? 3600);
    saveSession(refreshed); setSession(refreshed);
    return refreshed;
  }, []);

  useEffect(() => {
    if (!session || !supabaseUrl || !publishableKey) return;
    let cancelled = false;
    setLoadingWorkspace(true); setError('');
    void (async () => {
      const active = await refreshSession(session);
      const memberships = await request<Array<{ workspace_id: string; role: string }>>(active,
        'workspace_members?select=workspace_id,role&user_id=eq.' + encodeURIComponent(active.user.id) + '&order=created_at.asc');
      if (!memberships.length) throw new Error('This account is not assigned to a workspace yet. Ask a workspace owner to add your membership.');
      const available: Workspace[] = [];
      for (const membership of memberships) {
        const rows = await request<Array<{ id: string; name: string }>>(active,
          'workspaces?select=id,name&id=eq.' + encodeURIComponent(membership.workspace_id) + '&limit=1');
        if (rows[0]) available.push({ ...rows[0], role: membership.role });
      }
      if (!available.length) throw new Error('No accessible workspace was found for this account.');
      const selected = available[0];
      const results = await Promise.all([
        request<Record<string, unknown>[]>(active, 'tasks?select=*&workspace_id=eq.' + encodeURIComponent(selected.id) + '&order=due_date.asc'),
        request<Record<string, unknown>[]>(active, 'operational_exceptions?select=*&workspace_id=eq.' + encodeURIComponent(selected.id) + '&order=created_at.desc'),
      ]);
      if (cancelled) return;
      setWorkspace(selected); setTasks(results[0].map(toTask)); setExceptions(results[1].map(toException));
    })().catch((cause: unknown) => {
      if (!cancelled) setError(cause instanceof Error ? cause.message : 'Could not load your shared workspace.');
    }).finally(() => { if (!cancelled) setLoadingWorkspace(false); });
    return () => { cancelled = true; };
  }, [session, refreshSession]);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const payload = await authRequest(isSignup ? 'signup' : 'token?grant_type=password', { email: email.trim(), password });
      if (!payload.access_token) {
        setNotice('Account created. Check your email to confirm it, then sign in here.'); setIsSignup(false);
      } else {
        payload.expires_at = Math.floor(Date.now() / 1000) + (payload.expires_in ?? 3600);
        saveSession(payload); setSession(payload);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not authenticate.');
    } finally { setBusy(false); }
  }

  const updateTask = useCallback(async (taskId: string, status: TaskStatus) => {
    if (!session || !workspace || workspace.role === 'viewer') throw new Error('Your workspace role is read-only.');
    const active = await refreshSession(session);
    await request(active, 'tasks?workspace_id=eq.' + encodeURIComponent(workspace.id) + '&id=eq.' + encodeURIComponent(taskId),
      { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status }) });
    setTasks(current => current.map(task => task.id === taskId ? { ...task, status } : task));
  }, [session, workspace, refreshSession]);

  const updateException = useCallback(async (exceptionId: string, status: OperationalException['status']) => {
    if (!session || !workspace || workspace.role === 'viewer') throw new Error('Your workspace role is read-only.');
    const active = await refreshSession(session);
    await request(active, 'operational_exceptions?workspace_id=eq.' + encodeURIComponent(workspace.id) + '&id=eq.' + encodeURIComponent(exceptionId),
      { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ status }) });
    setExceptions(current => current.map(item => item.id === exceptionId ? { ...item, status } : item));
  }, [session, workspace, refreshSession]);

  if (!supabaseUrl || !publishableKey) return <main className="auth-screen"><section className="auth-card"><h1>OpsFlow setup required</h1><p>Supabase configuration is missing from this build. Check the GitHub Actions repository variables and redeploy.</p></section></main>;

  if (!session) return <main className="auth-screen"><section className="auth-card">
    <div className="auth-brand"><span className="brand-mark"><span /></span><span>ops<span>flow</span><small>OPERATIONS OS</small></span></div>
    <p className="auth-eyebrow">SHARED OPERATIONS WORKSPACE</p><h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
    <p className="auth-description">Sign in to access your team's shared tasks and operational exceptions.</p>
    <form onSubmit={submitAuth}>
      <label>Email address<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
      <label>Password<input type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} minLength={6} value={password} onChange={event => setPassword(event.target.value)} required /></label>
      {error && <p className="auth-error" role="alert">{error}</p>}{notice && <p className="auth-notice" role="status">{notice}</p>}
      <button className="auth-submit" disabled={busy}>{busy ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}</button>
    </form>
    <button className="auth-toggle" type="button" onClick={() => { setIsSignup(value => !value); setError(''); setNotice(''); }}>{isSignup ? 'Already have an account? Sign in' : 'Need an account? Sign up'}</button>
  </section></main>;

  if (loadingWorkspace) return <main className="auth-screen"><section className="auth-card"><h1>Loading workspace…</h1><p>Connecting to your shared OpsFlow data.</p></section></main>;
  if (error && !workspace) return <main className="auth-screen"><section className="auth-card"><h1>Workspace unavailable</h1><p className="auth-error">{error}</p><button className="auth-submit" onClick={() => { setError(''); setSession(current => current ? { ...current } : null); }}>Retry</button><button className="auth-toggle" onClick={() => void signOut()}>Sign out</button></section></main>;
  if (!workspace) return <main className="auth-screen"><section className="auth-card"><h1>Loading OpsFlow…</h1><p>Preparing your workspace.</p></section></main>;

  return <App initialTasks={tasks} initialExceptions={exceptions} workspaceName={workspace.name} userEmail={session.user.email ?? 'Workspace member'} role={workspace.role} onTaskStatusChange={updateTask} onExceptionStatusChange={updateException} onSignOut={() => void signOut()} />;
}

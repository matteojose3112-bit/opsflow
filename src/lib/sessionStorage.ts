export type Session = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in?: number;
  user: { id: string; email?: string };
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const SESSION_KEY = "opsflow-supabase-session-v1";

function browserStorage(): StorageLike | null {
  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isSession(value: unknown): value is Session {
  if (!isRecord(value) || !isRecord(value.user)) return false;
  return (
    typeof value.access_token === "string" &&
    value.access_token.length > 0 &&
    typeof value.refresh_token === "string" &&
    value.refresh_token.length > 0 &&
    typeof value.expires_at === "number" &&
    Number.isFinite(value.expires_at) &&
    typeof value.user.id === "string" &&
    value.user.id.length > 0 &&
    (value.user.email === undefined || typeof value.user.email === "string") &&
    (value.expires_in === undefined ||
      (typeof value.expires_in === "number" && Number.isFinite(value.expires_in)))
  );
}

export function loadSession(storage: StorageLike | null = browserStorage()): Session | null {
  try {
    if (!storage) return null;
    const raw = storage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(
  session: Session | null,
  storage: StorageLike | null = browserStorage(),
): boolean {
  try {
    if (!storage) return false;
    if (session) {
      if (!isSession(session)) return false;
      storage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      storage.removeItem(SESSION_KEY);
    }
    return true;
  } catch {
    return false;
  }
}

export const sessionStorageKey = SESSION_KEY;

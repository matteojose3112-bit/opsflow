import test from "node:test";
import assert from "node:assert/strict";
import {
  isSession,
  loadSession,
  saveSession,
  sessionStorageKey,
} from "../src/lib/sessionStorage.js";

function createStorage(initial = null) {
  let value = initial;
  return {
    getItem(key) {
      assert.equal(key, sessionStorageKey);
      return value;
    },
    setItem(key, next) {
      assert.equal(key, sessionStorageKey);
      value = next;
    },
    removeItem(key) {
      assert.equal(key, sessionStorageKey);
      value = null;
    },
    read() {
      return value;
    },
  };
}

const validSession = {
  access_token: "access",
  refresh_token: "refresh",
  expires_at: 1_900_000_000,
  expires_in: 3600,
  user: { id: "user-1", email: "person@example.com" },
};

test("validates the required Supabase session fields", () => {
  assert.equal(isSession(validSession), true);
  assert.equal(isSession({ ...validSession, access_token: "" }), false);
  assert.equal(isSession({ ...validSession, refresh_token: undefined }), false);
  assert.equal(isSession({ ...validSession, expires_at: Infinity }), false);
  assert.equal(isSession({ ...validSession, user: { id: "" } }), false);
  assert.equal(isSession(null), false);
});

test("loads a valid persisted session", () => {
  const storage = createStorage(JSON.stringify(validSession));
  assert.deepEqual(loadSession(storage), validSession);
});

test("rejects malformed or structurally invalid saved sessions", () => {
  const storage = createStorage("{");
  assert.equal(loadSession(storage), null);
  storage.setItem(sessionStorageKey, JSON.stringify({ access_token: "only" }));
  assert.equal(loadSession(storage), null);
});

test("saves and clears a session", () => {
  const storage = createStorage();
  assert.equal(saveSession(validSession, storage), true);
  assert.deepEqual(JSON.parse(storage.read()), validSession);
  assert.equal(saveSession(null, storage), true);
  assert.equal(loadSession(storage), null);
});

test("fails safely when storage reads or writes throw", () => {
  const blocked = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
    removeItem() { throw new Error("blocked"); },
  };
  assert.equal(loadSession(blocked), null);
  assert.equal(saveSession(validSession, blocked), false);
  assert.equal(saveSession(null, blocked), false);
});

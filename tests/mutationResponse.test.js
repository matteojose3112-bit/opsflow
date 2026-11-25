import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmSingleUpdatedRow } from '../src/lib/mutationResponse.js';

test('accepts exactly one row with the requested id and persisted status', () => {
  const row = { id: 'task-1', status: 'done' };
  assert.equal(confirmSingleUpdatedRow([row], 'task-1', 'done', 'Task'), row);
});

test('rejects an empty representation returned when no row was updated', () => {
  assert.throws(
    () => confirmSingleUpdatedRow([], 'task-1', 'done', 'Task'),
    /Task update was not confirmed/,
  );
});

test('rejects a null or non-array response', () => {
  assert.throws(() => confirmSingleUpdatedRow(null, 'task-1', 'done'));
  assert.throws(() => confirmSingleUpdatedRow({ id: 'task-1', status: 'done' }, 'task-1', 'done'));
});

test('rejects multiple affected rows', () => {
  assert.throws(
    () => confirmSingleUpdatedRow(
      [{ id: 'task-1', status: 'done' }, { id: 'task-2', status: 'done' }],
      'task-1',
      'done',
    ),
    /update was not confirmed/,
  );
});

test('rejects a different record id', () => {
  assert.throws(
    () => confirmSingleUpdatedRow([{ id: 'other-task', status: 'done' }], 'task-1', 'done'),
    /update was not confirmed/,
  );
});

test('rejects a response whose persisted status differs from the requested status', () => {
  assert.throws(
    () => confirmSingleUpdatedRow([{ id: 'task-1', status: 'in_progress' }], 'task-1', 'done'),
    /update was not confirmed/,
  );
});

test('uses a useful default label and supports exception-specific errors', () => {
  assert.throws(
    () => confirmSingleUpdatedRow([], 'exception-1', 'resolved', 'Exception'),
    /Exception update was not confirmed/,
  );
  assert.throws(
    () => confirmSingleUpdatedRow([], 'record-1', 'done'),
    /Record update was not confirmed/,
  );
});

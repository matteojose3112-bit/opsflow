const confirmationError = (recordLabel) =>
  new Error(
    `${recordLabel} update was not confirmed by the server. The record may have changed or you may no longer have permission. Reload the page to reconcile the saved state, then try again.`,
  );

/**
 * Validate the representation returned by a PostgREST PATCH request.
 * A successful HTTP status alone is insufficient: RLS can filter every row
 * and still return HTTP 200 with an empty representation.
 */
export function confirmSingleUpdatedRow(rows, expectedId, expectedStatus, recordLabel = 'Record') {
  if (!Array.isArray(rows) || rows.length !== 1) {
    throw confirmationError(recordLabel);
  }

  const [row] = rows;
  if (
    !row ||
    String(row.id) !== expectedId ||
    row.status !== expectedStatus
  ) {
    throw confirmationError(recordLabel);
  }

  return row;
}

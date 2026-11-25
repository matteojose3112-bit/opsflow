export interface ConfirmedStatusRow {
  id: string;
  status: string;
}

export function confirmSingleUpdatedRow(
  rows: unknown,
  expectedId: string,
  expectedStatus: string,
  recordLabel?: string,
): ConfirmedStatusRow;

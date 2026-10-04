/**
 * Formats a date using the reader's local calendar for completion inputs.
 * @param date - Valid instant; defaults to now. Invalid dates throw a RangeError.
 * @returns A YYYY-MM-DD date without UTC conversion; performs no I/O.
 */
export function localDate(date = new Date()): string {
  if (Number.isNaN(date.getTime())) throw new RangeError('Invalid date');
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((value, index) => String(value).padStart(index === 0 ? 4 : 2, '0'))
    .join('-');
}

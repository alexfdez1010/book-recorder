export interface RereadingYear {
  year: string;
  firstReads: number;
  rereads: number;
}

/**
 * Groups complete reading history into first readings and rereads by UTC year.
 * @param readings - Chronological ordinals from readingEntries; 1 is a first read.
 * @returns Ascending annual counts without mutating input; invalid dates are skipped.
 * Distinct catalogue ids retain their existing identity, even with identical titles.
 */
export function rereadsByYear(
  readings: readonly { finishedOn: Date | string; readingNumber: number }[],
): RereadingYear[] {
  const years = new Map<string, RereadingYear>();
  for (const reading of readings) {
    const date = new Date(reading.finishedOn);
    if (!Number.isFinite(date.getTime())) continue;
    const year = date.toISOString().slice(0, 4);
    const row = years.get(year) ?? { year, firstReads: 0, rereads: 0 };
    if (reading.readingNumber > 1) row.rereads += 1;
    else row.firstReads += 1;
    years.set(year, row);
  }
  return [...years.values()].sort((a, b) => a.year.localeCompare(b.year));
}

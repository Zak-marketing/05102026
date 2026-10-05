import type { WeightEntry, UserProfile } from '../types';

/** One order across chart, nutrition, report and PDF. Legacy entries use the timestamp in their ID. */
export function chronologicalWeights(entries: WeightEntry[]): WeightEntry[] {
  return [...entries].sort((a, b) => {
    const day = a.date.localeCompare(b.date);
    if (day) return day;
    const time = (item: WeightEntry) => item.createdAt ? new Date(item.createdAt).getTime() : Number(item.id.match(/^w_(\d{12,})/)?.[1] || 0);
    return time(a) - time(b);
  });
}
export function currentWeight(entries: WeightEntry[], profile: UserProfile): number {
  const ordered = chronologicalWeights(entries);
  return ordered.at(-1)?.weight ?? profile.currentWeight ?? profile.startingWeight;
}
export function initialWeight(profile: UserProfile): number { return profile.startingWeight; }

/** Count calendar days, including unlogged days, without daylight-saving offsets. */
export function weightTrackingDay(date: string, firstDate: string): number {
  const calendarDay = (value: string) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return NaN;
    const [year, month, day] = value.split('-').map(Number);
    const stamp = Date.UTC(year, month - 1, day);
    const normalized = new Date(stamp).toISOString().slice(0, 10);
    return normalized === value ? stamp / 86400_000 : NaN;
  };
  const elapsed = calendarDay(date) - calendarDay(firstDate);
  return Number.isFinite(elapsed) ? Math.max(1, elapsed + 1) : 1;
}

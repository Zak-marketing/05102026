// Keep the raw text editable (including an empty field or a trailing comma).
// Parse only complete decimal values when checking the next-step button.
export function parseLocalizedNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(trimmed)) return null;
  const result = Number(trimmed.replace(',', '.'));
  return Number.isFinite(result) ? result : null;
}

export function validNumber(value: string, min: number, max: number): boolean {
  const number = parseLocalizedNumber(value);
  return number !== null && number >= min && number <= max;
}

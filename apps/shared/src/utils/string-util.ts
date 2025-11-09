export function ParseKeyValueString(
  input: string,
  pairDelimiter = "|",
  keyValueDelimiter = "="
): Record<string, string> {
  if (!input) return {};

  return input
    .split(pairDelimiter)
    .reduce<Record<string, string>>((acc, segment) => {
      const [rawKey, rawValue] = segment.split(keyValueDelimiter);
      const key = rawKey?.trim();
      const value = rawValue?.trim();

      if (key) acc[key] = value ?? "";
      return acc;
    }, {});
}

export function ParseStringByComma(value: string): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

export function ParseStringByPipe(value: string): string[] {
  if (!value) return [];
  return value
    .split("|")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

export function GetLastPathSegment(path: string): string | null {
  if (typeof path !== "string") return null;
  const segments = path.split("/").filter(Boolean); // remove empty segments
  return segments.pop() || null;
}

export function RemoveLastPathSegment(path: string): string {
  if (typeof path !== "string" || !path.trim()) return path;

  const segments = path.split("/").filter(Boolean); // remove empty segments
  segments.pop(); // remove last segment

  // Rebuild path with leading slash (and no trailing slash)
  return segments.length ? `/${segments.join("/")}` : "/";
}

export function IsNumeric(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  return !isNaN(Number(value));
}

/**
 * Determines whether the given numeric value represents a "new model".
 * Returns true if the value is numeric and equal to 0, otherwise false.
 */
export function IsNewModel(value: unknown): boolean {
  if (!IsNumeric(value)) return false;
  return Number(value) === 0;
}

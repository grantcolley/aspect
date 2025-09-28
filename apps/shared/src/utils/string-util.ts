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

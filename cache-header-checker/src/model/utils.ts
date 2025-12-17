export function parseCacheControl(cacheControl: string | null) {
  const result: { [key: string]: string | true } = {};

  if (!cacheControl) return result;

  for (const part of cacheControl.split(",")) {
    const [rawKey, rawValue] = part.trim().split("=");
    const key = rawKey.toLowerCase();

    if (!rawValue) {
      result[key] = true;
    } else {
      result[key] = rawValue;
    }
  }

  return result;
}

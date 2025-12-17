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

export function formatDuration(seconds?: number): {
  minutes: number | string;
  seconds: number | string;
} {
  if (!seconds) return { minutes: "-", seconds: "-" };
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return { minutes, seconds: remainingSeconds };
}

/**
 *
 * @param secondsLeft
 * @returns HH:MM:SS dd:mm:yyyy
 */
export function getExpirationTimestamp(secondsLeft?: number): string {
  if (!secondsLeft) return "-";
  const date = new Date(Date.now() + secondsLeft * 1000);
  return (
    date
      .toLocaleDateString("hr-HR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .replaceAll(" ", "") +
    " - " +
    date.toLocaleTimeString("hr-HR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  );
}

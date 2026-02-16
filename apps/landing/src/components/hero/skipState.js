export const HERO_STORAGE_KEY = "solaris:hero-completed";
export const HERO_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * @param {{search: string, storedTimestamp: string | null, now?: number}} params
 * @returns {'none' | 'dev' | 'returning'}
 */
export function resolveHeroSkipMode({ search, storedTimestamp, now = Date.now() }) {
  if (new URLSearchParams(search).has("skip")) {
    return "dev";
  }

  if (!storedTimestamp) {
    return "none";
  }

  const timestamp = Number.parseInt(storedTimestamp, 10);
  if (!Number.isFinite(timestamp)) {
    return "none";
  }

  return now - timestamp < HERO_EXPIRY_MS ? "returning" : "none";
}

const cacheStore = new Map();

function buildKey(parts = []) {
  return parts.filter(Boolean).join(":");
}

export const cacheService = {
  get(parts) {
    const key = buildKey(parts);
    const entry = cacheStore.get(key);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      cacheStore.delete(key);
      return null;
    }
    return entry.value;
  },

  set(parts, value, ttlMs = 60_000) {
    const key = buildKey(parts);
    cacheStore.set(key, {
      value,
      expiresAt: Date.now() + ttlMs,
    });
    return value;
  },

  invalidatePrefix(prefix) {
    for (const key of cacheStore.keys()) {
      if (key.startsWith(prefix)) {
        cacheStore.delete(key);
      }
    }
  },
};

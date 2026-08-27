const buckets = new Map();

function getWindowKey(name, request, windowMs) {
  const identifier = request.user?.sub || request.ip || "anonymous";
  return `${name}:${identifier}:${Math.floor(Date.now() / windowMs)}`;
}

export function createRateLimiter({ name, limit, windowMs, message }) {
  return function rateLimit(request, _response, next) {
    const key = getWindowKey(name, request, windowMs);
    const nextCount = (buckets.get(key) || 0) + 1;
    buckets.set(key, nextCount);

    if (nextCount > limit) {
      const error = new Error(message || "Too many requests");
      error.statusCode = 429;
      return next(error);
    }

    return next();
  };
}

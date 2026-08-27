const state = {
  requestsTotal: 0,
  errorsTotal: 0,
  requestsByRoute: {},
  lastRequestAt: null,
  activeSockets: 0,
  notificationFailures: 0,
  syncFailures: 0,
  loginFailures: 0,
};

export const metricsService = {
  recordRequest({ method, route, statusCode, durationMs }) {
    const key = `${method}:${route}:${statusCode}`;
    state.requestsTotal += 1;
    state.requestsByRoute[key] = {
      count: (state.requestsByRoute[key]?.count || 0) + 1,
      durationMs,
    };
    state.lastRequestAt = new Date().toISOString();
    if (statusCode >= 400) {
      state.errorsTotal += 1;
    }
  },

  increment(name) {
    state[name] = (state[name] || 0) + 1;
  },

  setActiveSockets(count) {
    state.activeSockets = count;
  },

  snapshot() {
    return {
      ...state,
      routes: Object.entries(state.requestsByRoute).map(([routeKey, value]) => ({
        routeKey,
        ...value,
      })),
    };
  },
};

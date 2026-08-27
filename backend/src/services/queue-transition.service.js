const allowedTransitions = {
  waiting: ["called", "skipped", "cancelled", "no_show", "in_consultation"],
  called: ["in_consultation", "skipped", "cancelled", "no_show"],
  in_consultation: ["completed", "cancelled"],
  skipped: ["called", "in_consultation", "cancelled", "no_show"],
  completed: [],
  cancelled: [],
  no_show: [],
};

export const queueTransitionService = {
  assertCanTransition(currentStatus, nextStatus, options = {}) {
    if (currentStatus === nextStatus) {
      return;
    }

    const allowed = allowedTransitions[currentStatus] || [];

    if (!allowed.includes(nextStatus) && !options.override) {
      const error = new Error(`Invalid queue transition from ${currentStatus} to ${nextStatus}`);
      error.statusCode = 400;
      throw error;
    }

    if (currentStatus === "waiting" && nextStatus === "completed" && !options.override) {
      const error = new Error("Cannot complete a waiting token before consultation");
      error.statusCode = 400;
      throw error;
    }
  },
};

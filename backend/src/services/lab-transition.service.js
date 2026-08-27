const transitions = {
  requested: ["acknowledged", "sample_pending", "cancelled"],
  acknowledged: ["sample_pending", "sample_collected", "cancelled"],
  sample_pending: ["sample_collected", "recollection_required", "cancelled"],
  sample_collected: ["processing", "recollection_required", "cancelled"],
  processing: ["completed", "recollection_required", "cancelled"],
  completed: ["verified", "cancelled"],
  verified: ["doctor_reviewed"],
  doctor_reviewed: [],
  recollection_required: ["sample_pending", "sample_collected", "cancelled"],
  cancelled: [],
};

export const labTransitionService = {
  assertCanTransition(currentStatus, nextStatus) {
    if (!transitions[currentStatus]?.includes(nextStatus)) {
      const error = new Error(`Invalid lab transition from ${currentStatus} to ${nextStatus}`);
      error.statusCode = 409;
      throw error;
    }
  },
};

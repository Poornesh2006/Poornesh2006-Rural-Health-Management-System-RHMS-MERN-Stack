import { queueService } from "../services/queue.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function listQueue(request, response, next) {
  try {
    const queue = await queueService.listQueue(request.query);
    response.json(apiResponse("Queue fetched successfully", queue));
  } catch (error) {
    next(error);
  }
}

export async function listPublicQueue(request, response, next) {
  try {
    const queue = await queueService.listPublicQueue(request.query);
    response.json(apiResponse("Public queue fetched successfully", queue));
  } catch (error) {
    next(error);
  }
}

export async function callNext(request, response, next) {
  try {
    const queueEntry = await queueService.callNext(request.body || request.query, request.user);
    response.json(apiResponse("Next patient called successfully", queueEntry));
  } catch (error) {
    next(error);
  }
}

export async function updateQueueStatus(request, response, next) {
  try {
    const queueEntry = await queueService.transitionQueue(
      request.params.queueEntryId,
      request.body.status,
      request.user,
      request.body,
      { override: request.user.role === "admin" },
    );
    response.json(apiResponse("Queue updated successfully", queueEntry));
  } catch (error) {
    next(error);
  }
}

export async function changeQueuePriority(request, response, next) {
  try {
    const queueEntry = await queueService.changePriority(request.params.queueEntryId, request.body, request.user);
    response.json(apiResponse("Queue priority updated successfully", queueEntry));
  } catch (error) {
    next(error);
  }
}

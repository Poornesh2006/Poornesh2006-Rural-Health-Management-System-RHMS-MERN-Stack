import { Router } from "express";
import {
  changeQueuePriority,
  callNext,
  listPublicQueue,
  listQueue,
  updateQueueStatus,
} from "../../controllers/queue.controller.js";
import { requireAuth } from "../../middlewares/auth.js";

export const queueRouter = Router();

queueRouter.get("/public", listPublicQueue);
queueRouter.use(requireAuth);
queueRouter.get("/", listQueue);
queueRouter.post("/call-next", callNext);
queueRouter.post("/:queueEntryId/status", updateQueueStatus);
queueRouter.post("/:queueEntryId/priority", changeQueuePriority);

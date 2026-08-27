import { Router } from "express";
import { createUser, listUsers } from "../../controllers/user.controller.js";
import { requireAuth, requireRoles } from "../../middlewares/auth.js";

export const userRouter = Router();

userRouter.use(requireAuth, requireRoles("admin"));
userRouter.get("/", listUsers);
userRouter.post("/", createUser);

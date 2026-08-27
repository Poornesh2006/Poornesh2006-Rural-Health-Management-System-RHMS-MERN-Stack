import { userService } from "../services/user.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function listUsers(request, response, next) {
  try {
    const users = await userService.listUsers(request.query, request.tenant);
    response.json(apiResponse("Users fetched successfully", users));
  } catch (error) {
    next(error);
  }
}

export async function createUser(request, response, next) {
  try {
    const user = await userService.createUser(request.body, request.tenant);
    response.status(201).json(apiResponse("User created successfully", user));
  } catch (error) {
    next(error);
  }
}

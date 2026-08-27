import bcrypt from "bcryptjs";
import { userRepository } from "../repositories/user.repository.js";
import { createUserSchema, updateUserSchema } from "../validators/user.validator.js";

function sanitizeUser(user) {
  if (!user) {
    return null;
  }

  const source = user.toObject ? user.toObject() : user;
  const { passwordHash, refreshTokens, resetPasswordTokenHash, ...safeUser } = source;
  return safeUser;
}

export const userService = {
  async createUser(payload, tenant) {
    const parsedPayload = createUserSchema.parse(payload);
    const existingUser = await userRepository.findByEmail(parsedPayload.email);

    if (existingUser) {
      const error = new Error("A user with this email already exists");
      error.statusCode = 409;
      throw error;
    }

    const passwordHash = await bcrypt.hash(parsedPayload.password, 12);
    const user = await userRepository.create({
      ...parsedPayload,
      passwordHash,
      organizationRef: tenant?.organizationId || null,
      primaryFacilityRef: payload.primaryFacilityRef || tenant?.facilityId || null,
      activeFacilityRef: payload.primaryFacilityRef || tenant?.facilityId || null,
      allowedFacilities: payload.allowedFacilities?.length ? payload.allowedFacilities : tenant?.facilityId ? [tenant.facilityId] : [],
    });

    return sanitizeUser(user);
  },

  async listUsers(query, tenant) {
    const result = await userRepository.findAll({
      search: query.search || "",
      role: query.role,
      page: Number(query.page || 1),
      limit: Number(query.limit || 10),
      tenant,
    });

    return {
      items: result.items.map(sanitizeUser),
      pagination: {
        page: Number(query.page || 1),
        limit: Number(query.limit || 10),
        total: result.total,
      },
    };
  },

  async updateUser(userId, payload) {
    const parsedPayload = updateUserSchema.parse(payload);
    const user = await userRepository.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    Object.assign(user, parsedPayload);
    await user.save();
    return sanitizeUser(user);
  },

  async deleteUser(userId) {
    const user = await userRepository.findById(userId);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    await user.deleteOne();
    return { deleted: true };
  },

  sanitizeUser,
};

import { User } from "../models/user.model.js";
import { tenantService } from "../services/tenant.service.js";

export const userRepository = {
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase() });
  },

  async findById(id) {
    return User.findById(id);
  },

  async create(payload) {
    const user = await User.create(payload);
    return user.toObject();
  },

  async findAll({ search = "", role, page = 1, limit = 10, tenant }) {
    const query = tenantService.scopeQuery({}, tenant);

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { fullName: new RegExp(search, "i") },
        { email: new RegExp(search, "i") },
        { phone: new RegExp(search, "i") },
      ];
    }

    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      User.countDocuments(query),
    ]);

    return { items, total };
  },
};

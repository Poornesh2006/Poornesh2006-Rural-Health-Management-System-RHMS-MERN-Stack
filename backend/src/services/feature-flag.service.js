import { env } from "../config/env.js";
import { FeatureFlag } from "../models/feature-flag.model.js";

export const featureFlagService = {
  async listFlags() {
    return FeatureFlag.find().sort({ key: 1 }).lean();
  },

  async isEnabled(key, context = {}) {
    const flag = await FeatureFlag.findOne({ key }).lean();

    if (!flag || !flag.enabled) {
      return false;
    }

    if (flag.environmentScope?.length && !flag.environmentScope.includes(env.nodeEnv)) {
      return false;
    }

    if (flag.organizationScope?.length && !flag.organizationScope.map(String).includes(String(context.organizationId))) {
      return false;
    }

    if (flag.facilityScope?.length && !flag.facilityScope.map(String).includes(String(context.facilityId))) {
      return false;
    }

    if (flag.roleScope?.length && !flag.roleScope.includes(context.role)) {
      return false;
    }

    if (flag.userScope?.length && !flag.userScope.map(String).includes(String(context.userId))) {
      return false;
    }

    return true;
  },
};

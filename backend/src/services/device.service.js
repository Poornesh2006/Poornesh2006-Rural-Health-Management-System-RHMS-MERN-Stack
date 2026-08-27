import { Device } from "../models/device.model.js";

export const deviceService = {
  async listDevices(tenant) {
    return Device.find({ facility: tenant.facilityId }).sort({ createdAt: -1 }).lean();
  },

  async registerDevice(payload, actor, tenant) {
    return Device.findOneAndUpdate(
      { deviceId: payload.deviceId },
      {
        deviceId: payload.deviceId,
        organization: tenant.organizationId,
        facility: tenant.facilityId,
        deviceType: payload.deviceType || "workstation",
        assignedUser: actor.sub,
        name: payload.name,
        platform: payload.platform || "",
        appVersion: payload.appVersion || "",
        lastSeen: new Date(),
        pushToken: payload.pushToken || "",
        trustedStatus: true,
      },
      { new: true, upsert: true },
    ).lean();
  },

  async revokeDevice(deviceId) {
    const device = await Device.findOneAndUpdate(
      { deviceId },
      { trustedStatus: false, revokedAt: new Date() },
      { new: true },
    ).lean();

    if (!device) {
      const error = new Error("Device not found");
      error.statusCode = 404;
      throw error;
    }

    return device;
  },
};

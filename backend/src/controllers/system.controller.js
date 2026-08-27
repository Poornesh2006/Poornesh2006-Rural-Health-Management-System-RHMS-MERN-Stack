import { backupService } from "../services/backup.service.js";
import { systemSettingService } from "../services/system-setting.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function getSystemSettings(_request, response, next) {
  try {
    const settings = await systemSettingService.getSettings();
    response.json(apiResponse("System settings fetched successfully", settings));
  } catch (error) {
    next(error);
  }
}

export async function updateSystemSettings(request, response, next) {
  try {
    const settings = await systemSettingService.updateSettings(request.body, request.user.sub);
    response.json(apiResponse("System settings updated successfully", settings));
  } catch (error) {
    next(error);
  }
}

export async function listBackups(_request, response, next) {
  try {
    const backups = await backupService.listBackups();
    response.json(apiResponse("Backups fetched successfully", backups));
  } catch (error) {
    next(error);
  }
}

export async function createBackup(request, response, next) {
  try {
    const backup = await backupService.createBackup(request.user.sub);
    response.json(apiResponse("Backup created successfully", backup));
  } catch (error) {
    next(error);
  }
}

export async function requestRestore(request, response, next) {
  try {
    const restore = await backupService.requestRestore(request.params.backupId, request.user.sub);
    response.json(apiResponse("Restore request recorded successfully", restore));
  } catch (error) {
    next(error);
  }
}

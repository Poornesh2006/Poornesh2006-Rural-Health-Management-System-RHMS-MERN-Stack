import { pharmacyService } from "../services/pharmacy.service.js";
import { apiResponse } from "../utils/api-response.js";

export async function createMedicine(request, response, next) {
  try {
    const result = await pharmacyService.createMedicine(request.body, request.user);
    response.status(201).json(apiResponse("Medicine created successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listMedicines(request, response, next) {
  try {
    const result = await pharmacyService.listMedicines(request.query);
    response.json(apiResponse("Medicines fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function updateMedicine(request, response, next) {
  try {
    const result = await pharmacyService.updateMedicine(request.params.medicineId, request.body, request.user);
    response.json(apiResponse("Medicine updated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function deactivateMedicine(request, response, next) {
  try {
    const result = await pharmacyService.deactivateMedicine(request.params.medicineId, request.user);
    response.json(apiResponse("Medicine deactivated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function createSupplier(request, response, next) {
  try {
    const result = await pharmacyService.createSupplier(request.body, request.user);
    response.status(201).json(apiResponse("Supplier created successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listSuppliers(request, response, next) {
  try {
    const result = await pharmacyService.listSuppliers(request.query);
    response.json(apiResponse("Suppliers fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function updateSupplier(request, response, next) {
  try {
    const result = await pharmacyService.updateSupplier(request.params.supplierId, request.body, request.user);
    response.json(apiResponse("Supplier updated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function deactivateSupplier(request, response, next) {
  try {
    const result = await pharmacyService.deactivateSupplier(request.params.supplierId, request.user);
    response.json(apiResponse("Supplier deactivated successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function receiveStock(request, response, next) {
  try {
    const result = await pharmacyService.receiveStock(request.body, request.user);
    response.status(201).json(apiResponse("Stock received successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function adjustStock(request, response, next) {
  try {
    const result = await pharmacyService.adjustStock(request.body, request.user);
    response.json(apiResponse("Stock adjusted successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getMedicineAvailability(request, response, next) {
  try {
    const result = await pharmacyService.getMedicineAvailability(request.params.medicineId);
    response.json(apiResponse("Medicine availability fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listMedicineBatches(request, response, next) {
  try {
    const result = await pharmacyService.listMedicineBatches(request.params.medicineId);
    response.json(apiResponse("Medicine batches fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getLowStockList(request, response, next) {
  try {
    const result = await pharmacyService.getLowStockList();
    response.json(apiResponse("Low stock list fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getExpiryAlerts(request, response, next) {
  try {
    const result = await pharmacyService.getExpiryAlerts();
    response.json(apiResponse("Expiry alerts fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function listPendingPrescriptions(request, response, next) {
  try {
    const result = await pharmacyService.listPendingPrescriptions();
    response.json(apiResponse("Pending prescriptions fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getPrescriptionById(request, response, next) {
  try {
    const result = await pharmacyService.getPrescriptionById(request.params.prescriptionId);
    response.json(apiResponse("Prescription fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function dispensePrescription(request, response, next) {
  try {
    const result = await pharmacyService.dispensePrescription(request.params.prescriptionId, request.body, request.user);
    response.json(apiResponse("Prescription dispensed successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function submitSubstitutionRequest(request, response, next) {
  try {
    const result = await pharmacyService.submitSubstitutionRequest(request.params.prescriptionId, request.body, request.user);
    response.json(apiResponse("Substitution request submitted successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function approveSubstitution(request, response, next) {
  try {
    const result = await pharmacyService.reviewSubstitution(
      request.params.prescriptionId,
      Number(request.params.requestIndex),
      true,
      request.user,
    );
    response.json(apiResponse("Substitution approved successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function rejectSubstitution(request, response, next) {
  try {
    const result = await pharmacyService.reviewSubstitution(
      request.params.prescriptionId,
      Number(request.params.requestIndex),
      false,
      request.user,
    );
    response.json(apiResponse("Substitution rejected successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getPatientPrescriptionHistory(request, response, next) {
  try {
    const result = await pharmacyService.getPatientHistory(request.params.patientId);
    response.json(apiResponse("Patient prescription history fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getPatientDispensingHistory(request, response, next) {
  try {
    const result = await pharmacyService.getDispensingHistory(request.params.patientId);
    response.json(apiResponse("Patient dispensing history fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

export async function getPharmacyDailyStats(request, response, next) {
  try {
    const result = await pharmacyService.getDailyStatistics();
    response.json(apiResponse("Pharmacy statistics fetched successfully", result));
  } catch (error) {
    next(error);
  }
}

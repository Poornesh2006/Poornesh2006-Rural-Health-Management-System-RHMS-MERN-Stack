import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.js";
import {
  adjustStock,
  approveSubstitution,
  createMedicine,
  createSupplier,
  deactivateMedicine,
  deactivateSupplier,
  dispensePrescription,
  getExpiryAlerts,
  getLowStockList,
  getMedicineAvailability,
  listMedicineBatches,
  getPatientDispensingHistory,
  getPatientPrescriptionHistory,
  getPharmacyDailyStats,
  getPrescriptionById,
  listMedicines,
  listPendingPrescriptions,
  listSuppliers,
  receiveStock,
  rejectSubstitution,
  submitSubstitutionRequest,
  updateMedicine,
  updateSupplier,
} from "../../controllers/pharmacy.controller.js";

export const pharmacyRouter = Router();

pharmacyRouter.use(requireAuth);
pharmacyRouter.get("/medicines", listMedicines);
pharmacyRouter.post("/medicines", createMedicine);
pharmacyRouter.patch("/medicines/:medicineId", updateMedicine);
pharmacyRouter.post("/medicines/:medicineId/deactivate", deactivateMedicine);
pharmacyRouter.get("/medicines/:medicineId/availability", getMedicineAvailability);
pharmacyRouter.get("/medicines/:medicineId/batches", listMedicineBatches);
pharmacyRouter.get("/suppliers", listSuppliers);
pharmacyRouter.post("/suppliers", createSupplier);
pharmacyRouter.patch("/suppliers/:supplierId", updateSupplier);
pharmacyRouter.post("/suppliers/:supplierId/deactivate", deactivateSupplier);
pharmacyRouter.post("/stock/receive", receiveStock);
pharmacyRouter.post("/stock/adjust", adjustStock);
pharmacyRouter.get("/stock/alerts/low", getLowStockList);
pharmacyRouter.get("/stock/alerts/expiry", getExpiryAlerts);
pharmacyRouter.get("/prescriptions/pending", listPendingPrescriptions);
pharmacyRouter.get("/prescriptions/:prescriptionId", getPrescriptionById);
pharmacyRouter.post("/prescriptions/:prescriptionId/dispense", dispensePrescription);
pharmacyRouter.post("/prescriptions/:prescriptionId/substitution", submitSubstitutionRequest);
pharmacyRouter.post("/prescriptions/:prescriptionId/substitution/:requestIndex/approve", approveSubstitution);
pharmacyRouter.post("/prescriptions/:prescriptionId/substitution/:requestIndex/reject", rejectSubstitution);
pharmacyRouter.get("/patients/:patientId/prescriptions", getPatientPrescriptionHistory);
pharmacyRouter.get("/patients/:patientId/dispensing-history", getPatientDispensingHistory);
pharmacyRouter.get("/stats/daily", getPharmacyDailyStats);

// Read-only inventory for reviewing synthetic records before a real deployment.
// This script deliberately performs no update or delete operation.
import mongoose from "mongoose";
import { env } from "../config/env.js";
import { Organization } from "../models/organization.model.js";
import { Patient } from "../models/patient.model.js";
import { User } from "../models/user.model.js";
import { Appointment } from "../models/appointment.model.js";
import { Visit } from "../models/visit.model.js";

async function audit() {
  await mongoose.connect(env.mongoUri);
  const syntheticOrganizations = await Organization.find({ organizationCode: /^DEMO-/ }).select("_id organizationCode name").lean();
  const organizationIds = syntheticOrganizations.map((item) => item._id);
  const counts = {
    syntheticOrganizations: syntheticOrganizations.length,
    syntheticPatients: await Patient.countDocuments({ $or: [{ organizationRef: { $in: organizationIds } }, { patientId: /^DEMO-/ }] }),
    syntheticUsers: await User.countDocuments({ $or: [{ organizationRef: { $in: organizationIds } }, { email: /@demo\.rhms\.invalid$/ }] }),
    syntheticAppointments: await Appointment.countDocuments({ $or: [{ organizationRef: { $in: organizationIds } }, { appointmentNumber: /^DEMO-/ }] }),
    syntheticVisits: await Visit.countDocuments({ $or: [{ organizationRef: { $in: organizationIds } }, { visitId: /^DEMO-/ }] }),
  };
  console.table(counts);
  console.log("Read-only audit complete. Review these counts before any manually approved cleanup; this command never deletes data.");
}

audit().catch((error) => { console.error(`Synthetic-data audit failed: ${error.message}`); process.exitCode = 1; }).finally(() => mongoose.disconnect());

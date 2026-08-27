export function generatePatientId() {
  const year = new Date().getFullYear();
  return `RPHC-PAT-${year}-${String(Date.now()).slice(-6)}`;
}

export function generateVisitId() {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `VIS-${stamp}-${String(Date.now()).slice(-6)}`;
}

function buildStampedId(prefix) {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${prefix}-${stamp}-${String(Date.now()).slice(-6)}`;
}

export function generatePrescriptionNumber() {
  return buildStampedId("RX");
}

export function generateLabRequestNumber() {
  return buildStampedId("LAB");
}

export function generateSampleId() {
  return buildStampedId("SMP");
}

export function generateCertificateNumber() {
  return buildStampedId("VAC");
}

export function generateMedicineCode() {
  return buildStampedId("MED");
}

export function generateSupplierCode() {
  return buildStampedId("SUP");
}

export function generateVaccineCode() {
  return buildStampedId("VAX");
}

export function generateAuditId(prefix = "AUD") {
  return buildStampedId(prefix);
}

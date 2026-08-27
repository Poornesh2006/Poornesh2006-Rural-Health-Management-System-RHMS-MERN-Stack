export function calculateAge(dateOfBirth) {
  if (!dateOfBirth) {
    return null;
  }

  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return age;
}

export function calculateBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg) {
    return null;
  }

  const heightM = Number(heightCm) / 100;

  if (!heightM) {
    return null;
  }

  return Number((Number(weightKg) / (heightM * heightM)).toFixed(1));
}

/*
  Sex, Age, Race
*/

export function getPatientName(patient: any): string {
  const name = patient.name?.[0];
  if (!name) return "Unknown";
  const given = name.given?.join(" ") ?? "";
  const family = name.family ?? "";
  const fullName = `${given} ${family}`.trim();
  return fullName || "Unknown";
}

export function getPatientSex(patient: any): string {
  return patient.gender ?? "unknown";
}

export function getPatientAge(patient: any): number {
  if (!patient.birthDate) {
    throw new Error("Patient birthDate is missing");
  }

  const birthDate = new Date(patient.birthDate);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

export function getPatientRace(patient: any): string[] {
  const raceExtension = patient.extension?.find(
    (ext: any) => ext.url === "http://hl7.org/fhir/us/core/StructureDefinition/us-core-race"
  );

  const raceValues =
    raceExtension?.extension
      ?.filter((sub: any) => sub.url === "ombCategory")
      ?.map((sub: any) => sub.valueCoding?.display)
      ?.filter(Boolean) ?? []; // removes any undefined or null values from list

  return raceValues.length > 0 ? raceValues : ["Unknown"];
}
/*
    Total Cholesterol, HDL - Cholesterol, Systolic Blood Pressure
*/

const LOINC_CODES = {
  cholesterol: "2093-3", // Cholesterol [Mass/volume] in Serum or Plasma
  hdl: "2085-9", // Cholesterol in HDL [Mass/volume] in Serum or Plasma
  systolicBloodPressure: "8480-6", // Systolic blood pressure
};

function findObservationValue(observations: any[], loincCode: string): number {
  for (const obs of observations) {
    const codings = obs.code?.coding || [];
    if (codings.some((coding: any) => coding.code === loincCode)) {
      return obs.valueQuantity?.value ?? 0;
    }
  }
  return 0;
}

export function getPatientCholesterol(observations: any[]): number {
  return findObservationValue(observations, LOINC_CODES.cholesterol);
}

export function getPatientHDL(observations: any[]): number {
  return findObservationValue(observations, LOINC_CODES.hdl);
}

export function getPatientSystolicBloodPressure(observations: any[]): number {
  return findObservationValue(observations, LOINC_CODES.systolicBloodPressure);
}

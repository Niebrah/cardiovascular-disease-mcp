/*
    Total Cholesterol, HDL - Cholesterol, Systolic Blood Pressure
*/

type vitalsDict = {
  [key: string]: {
    loinc: string;
    default: number;
  };
}

export const vitalsLookup: vitalsDict = {
  totalCholesterol: {
    loinc: "2093-3",
    default: 200,
  },
  hdl: {
    loinc: "2085-9",
    default: 50,
  },
  systolicBloodPressure: {
    loinc: "8480-6",
    default: 120,
  },
};

function getObservationVal(
  observations: any[],
  vitalKey: keyof typeof vitalsLookup
): number {
  const { loinc, default: defaultValue } = vitalsLookup[vitalKey];

  for (const obs of observations) {
    const codes = obs.code?.coding ?? [];
    if (codes.some((code: any) => code.code === loinc)) {
      return obs.valueQuantity?.value ?? defaultValue;
    }
  }

  return defaultValue;
}

export const getPatientCholesterol = (obs: any[]) =>
  getObservationVal(obs, "totalCholesterol");

export const getPatientHDL = (obs: any[]) =>
  getObservationVal(obs, "hdl");

export const getPatientSystolicBloodPressure = (obs: any[]) =>
  getObservationVal(obs, "systolicBloodPressure");

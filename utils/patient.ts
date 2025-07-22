type Conditions = {
  hypertensive: boolean;
  smoker: boolean;
  diabetic: boolean;
};

export type Patient = {
  name: string;
  age: number;
  gender: string;
  race: string;
  bmi: number;
  totalCholesterol: number;
  hdl: number;
  systolicBloodPressure: number;
  conditions: Conditions;
};
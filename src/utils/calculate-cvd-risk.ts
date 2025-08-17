import { Patient } from "./patient";

/**
 * Computes the ASCVD Risk Estimate for an individual over the next 10 years.
 * @param patientInfo - Patient object from ASCVDRisk data model
 * @returns {*} Returns the risk score or null if not in the appropriate age range
 */

const calculateCVDRisk = (patientInfo: Patient) => {
  if (patientInfo.age < 40 || patientInfo.age > 79) {
    return null;
  }
  const lnAge = Math.log(patientInfo.age);
  const lnTotalChol = Math.log(patientInfo.totalCholesterol);
  const lnHdl = Math.log(patientInfo.hdl);
  const trlnsbp = patientInfo.conditions.hypertensive
    ? Math.log(patientInfo.systolicBloodPressure)
    : 0;
  const ntlnsbp = patientInfo.conditions.hypertensive
    ? 0
    : Math.log(patientInfo.systolicBloodPressure);
  const ageTotalChol = lnAge * lnTotalChol;
  const ageHdl = lnAge * lnHdl;
  const agetSbp = lnAge * trlnsbp;
  const agentSbp = lnAge * ntlnsbp;
  const ageSmoke = patientInfo.conditions.smoker ? lnAge : 0;

  const isAA = patientInfo.race.includes("African American");
  const isMale = patientInfo.gender.toLowerCase() === "male";
  let s010Ret = 0;
  let mnxbRet = 0;
  let predictRet = 0;

  const calculateScore = () => {
    if (isAA && !isMale) {
      s010Ret = 0.95334;
      mnxbRet = 86.6081;
      predictRet =
        17.1141 * lnAge +
        0.9396 * lnTotalChol +
        -18.9196 * lnHdl +
        4.4748 * ageHdl +
        29.2907 * trlnsbp +
        -6.4321 * agetSbp +
        27.8197 * ntlnsbp +
        -6.0873 * agentSbp +
        0.6908 * Number(patientInfo.conditions.smoker) +
        0.8738 * Number(patientInfo.conditions.diabetic);
    } else if (!isAA && !isMale) {
      s010Ret = 0.96652;
      mnxbRet = -29.1817;
      predictRet =
        -29.799 * lnAge +
        4.884 * lnAge ** 2 +
        13.54 * lnTotalChol +
        -3.114 * ageTotalChol +
        -13.578 * lnHdl +
        3.149 * ageHdl +
        2.019 * trlnsbp +
        1.957 * ntlnsbp +
        7.574 * Number(patientInfo.conditions.smoker) +
        -1.665 * ageSmoke +
        0.661 * Number(patientInfo.conditions.diabetic);
    } else if (isAA && isMale) {
      s010Ret = 0.89536;
      mnxbRet = 19.5425;
      predictRet =
        2.469 * lnAge +
        0.302 * lnTotalChol +
        -0.307 * lnHdl +
        1.916 * trlnsbp +
        1.809 * ntlnsbp +
        0.549 * Number(patientInfo.conditions.smoker) +
        0.645 * Number(patientInfo.conditions.diabetic);
    } else {
      s010Ret = 0.91436;
      mnxbRet = 61.1816;
      predictRet =
        12.344 * lnAge +
        11.853 * lnTotalChol +
        -2.664 * ageTotalChol +
        -7.99 * lnHdl +
        1.769 * ageHdl +
        1.797 * trlnsbp +
        1.764 * ntlnsbp +
        7.837 * Number(patientInfo.conditions.smoker) +
        -1.795 * ageSmoke +
        0.658 * Number(patientInfo.conditions.diabetic);
    }

    const pct = 1 - s010Ret ** Math.exp(predictRet - mnxbRet);
    return Math.round(pct * 100 * 10) / 10;
  };
  return calculateScore();
};

export default calculateCVDRisk;

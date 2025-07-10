import math
from typing import Optional, Dict, Any
from dataclasses import dataclass


@dataclass
class Conditions:
    hypertensive: bool
    smoker: bool
    diabetic: bool


@dataclass
class Patient:
    age: int
    gender: str
    race: str
    bmi: float
    totalCholesterol: float
    hdl: float
    systolicBloodPressure: float
    conditions: Conditions


def compute_ten_year_score(patient_info: Patient) -> float:
    """
    Computes the ASCVD Risk Estimate for an individual over the next 10 years.
    Args:
        patient_info (Patient): - patientInfo object from ASCVDRisk data model
    Returns:
        float: Returns the risk score or null if not in the appropriate age range
    """
    age = patient_info['age']
    # Check if age is within the valid range (40–79)
    if age < 40 or age > 79:
        return None

    ln_age = math.log(age)
    ln_total_chol = math.log(patient_info['totalCholesterol'])
    ln_hdl = math.log(patient_info['hdl'])

    hypertensive = patient_info['conditions']['hypertensive']
    sbp = float(patient_info['systolicBloodPressure'])

    trlnsbp = math.log(sbp) if hypertensive else 0
    ntlnsbp = 0 if hypertensive else math.log(sbp)

    age_total_chol = ln_age * ln_total_chol
    age_hdl = ln_age * ln_hdl
    aget_sbp = ln_age * trlnsbp
    agent_sbp = ln_age * ntlnsbp
    age_smoke = ln_age if patient_info['conditions']['smoker'] else 0

    is_aa = patient_info['race'] == 'aa'
    is_male = patient_info['gender'] == 'male'

    smoker = int(patient_info['conditions']['smoker'])
    diabetic = int(patient_info['conditions']['diabetic'])

    # Female risk
    if is_aa and not is_male:
        s010_ret = 0.95334
        mnxb_ret = 86.6081
        predict_ret = (
            17.1141 * ln_age + 0.9396 * ln_total_chol + -18.9196 * ln_hdl +
            4.4748 * age_hdl + 29.2907 * trlnsbp + -6.4321 * aget_sbp +
            27.8197 * ntlnsbp + -6.0873 * agent_sbp + 0.6908 * smoker + 0.8738 * diabetic
        )
    elif not is_aa and not is_male:
        s010_ret = 0.96652
        mnxb_ret = -29.1817
        predict_ret = (
            -29.799 * ln_age + 4.884 * ln_age ** 2 + 13.54 * ln_total_chol +
            -3.114 * age_total_chol + -13.578 * ln_hdl + 3.149 * age_hdl +
            2.019 * trlnsbp + 1.957 * ntlnsbp + 7.574 * smoker +
            -1.665 * age_smoke + 0.661 * diabetic
        )

    # Male risk
    elif is_aa and is_male:
        s010_ret = 0.89536
        mnxb_ret = 19.5425
        predict_ret = (
            2.469 * ln_age + 0.302 * ln_total_chol + -0.307 * ln_hdl +
            1.916 * trlnsbp + 1.809 * ntlnsbp + 0.549 * smoker + 0.645 * diabetic
        )
    else:
        s010_ret = 0.91436
        mnxb_ret = 61.1816
        predict_ret = (
            12.344 * ln_age + 11.853 * ln_total_chol + -2.664 * age_total_chol +
            -7.99 * ln_hdl + 1.769 * age_hdl + 1.797 * trlnsbp +
            1.764 * ntlnsbp + 7.837 * smoker + -1.795 * age_smoke +
            0.658 * diabetic
        )

    pct = 1 - s010_ret ** math.exp(predict_ret - mnxb_ret)
    return round(pct * 100, 1)

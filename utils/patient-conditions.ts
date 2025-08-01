/*
    Diabetes status, Smoking status, Hypertension status
*/

const diabetesSNOWMED = ["46635009", "44054006", "73211009"];
const hypertensionSNOWMED = ["59621000", "38341003", "35105007"];
const smokingLoinc = "72166-2";
const negSmoking = "266919005";
const posSmoking = ["449868002", "428041000124106", "77176002", "428071000124103", "428061000124105"];
const hba1cLoinc= "4548-4"; // Hemoglobin A1c
const fastingGlucoseLoinc = "1558-6"; // Fasting plasma glucose

function getConditionValue(
    conditions: any[],
    conditionSNOWMED: string[],
): boolean {
    for (const cond of conditions) {
        const codeVal = cond.code?.coding?.code
        if (!codeVal) {
            continue;
        }
        return conditionSNOWMED.includes(codeVal) ? true : false;
    }

    return false;
}



export function getPatientDiabetesStatus(conditions: any[], observations: any[]): boolean {
    // Check for SNOWMED conditions
    const hasDiagnosis = getConditionValue(conditions, diabetesSNOWMED);
    if (hasDiagnosis) return true;

    // Check hba1c and glucose observations
    for (const obs of observations) {
        const codes = obs.code?.coding ?? [];
        const code = codes.find(
        (c: any) => c.code === hba1cLoinc || c.code === fastingGlucoseLoinc
        );
        if (!code) continue;

        const value = obs.valueQuantity?.value;
        if (!value) continue;

        if (code.code === hba1cLoinc && value >= 6.5) return true;
        if (code.code === fastingGlucoseLoinc && value >= 126.0) return true;
    }

    return false;
}




export function getPatientSmokingStatus(observations: any): boolean {
    for (const obs of observations) {
        const codes = obs.code?.coding ?? [];
        if (codes.some((code: any) => code.code === smokingLoinc)) {
            const codeVal = obs.valueCodeableConcept?.coding?.code
            if (!codeVal) {
                continue;
            }
            if (codeVal === negSmoking) {
                return false;
            }
            return posSmoking.includes(codeVal) ? true : false;
        }
    }
    return false;
}

export function getPatientHypertensionStatus(conditions: any): boolean {
    return getConditionValue(conditions, hypertensionSNOWMED);
}
/*
    Diabetes status, Smoking status, Hypertension status
*/

const diabetesSNOWMED = ["46635009", "44054006", "73211009"];
const hypertensionSNOWMED = ["59621000", "38341003", "35105007"];
const smokingLoinc = "72166-2";
const negSmoking = "266919005"
const posSmoking = ["449868002", "428041000124106", "77176002", "428071000124103", "428061000124105"]

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

export function getPatientDiabetesStatus(conditions: any): boolean {
    return getConditionValue(conditions, diabetesSNOWMED);
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
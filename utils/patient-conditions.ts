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
    snowmedCodes: string[],
): boolean {
    for (const cond of conditions) {
        const codeVal = cond.code?.coding[0]?.code
        if (!codeVal) {
            continue;
        }
        else if (snowmedCodes.includes(codeVal)) {
            return true;
        }
    }
    return false;
}

export function getPatientSmokingStatus(observations: any): boolean {
    for (const obs of observations) {
        const code = obs.code?.coding[0] ?? [];
        if (code === smokingLoinc) {
            continue;
        }
        const codeVal = obs.valueCodeableConcept?.coding?.code
        console.log("Smoking codeVal:", codeVal);
        if (!codeVal) {
            continue;
        }
        else if (codeVal === negSmoking) {
            return false;
        }
        else if (posSmoking.includes(codeVal)) {
            return true;
        }
    }
    return false;
}

export function getPatientDiabetesStatus(conditions: any): boolean {
    return getConditionValue(conditions, diabetesSNOWMED);
}

export function getPatientHypertensionStatus(conditions: any): boolean {
    return getConditionValue(conditions, hypertensionSNOWMED);
}
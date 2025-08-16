import axios from "axios";

const CLINICAL_TRIALS_API_URL = "https://clinicaltrials.gov/api/v2";

export async function fetchClinicalTrials(condition: string) {
    const res = await axios.get(`${CLINICAL_TRIALS_API_URL}/studies`, {
        params: {
            condition,
            fields: "id,protocolSection.identificationModule.briefTitle,protocolSection.conditionsModule.conditions",
        },
        headers: {
            Accept: "application/json",
        },
    });

    const studies = res.data.studies;
    return studies;
}
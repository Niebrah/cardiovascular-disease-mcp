import axios from "axios";

const CLINICAL_TRIALS_API_URL = "https://clinicaltrials.gov/api/v2";

export async function fetchClinicalTrials(args: Record<any, any>) {
    const res = await axios.get(`${CLINICAL_TRIALS_API_URL}/studies`, {
        params: {
            ...args
        },
        headers: {
            Accept: "application/json",
        },
    });

    const studies = res.data.studies;
    return studies;
}
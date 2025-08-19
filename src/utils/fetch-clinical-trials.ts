import axios from "axios";

const API_URL = "https://clinicaltrials.gov/api/v2";

export async function fetchClinicalTrials(args: Record<any, any>, nctID: string | null = null) {
    const res = await axios.get(`${API_URL}/studies${nctID ? `/${nctID}` : ""}`, {
        params: { ...args },
        headers: { Accept: "application/json" },
    });

    const studies = res.data.studies;
    return studies;
}
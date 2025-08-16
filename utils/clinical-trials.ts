import axios from "axios";

const CLINICAL_TRIALS_API_URL = "https://clinicaltrials.gov/api/v2";

async function fetchData(url: string) {
  try {
    const res = await axios.get(url);
    return res?.data;
  } catch (error) {
    console.error("Unexpected error:", error);
    throw error;
  }
}

export async function fetchStudies() {
    const res = await fetchData(`${CLINICAL_TRIALS_API_URL}/studies`);
    return res;
}
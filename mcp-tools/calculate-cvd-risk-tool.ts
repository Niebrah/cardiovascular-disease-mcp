import { z } from "zod";
import { getFhirContext, getPatientIdIfContextExists } from "../fhir-utilities";
import { createTextResponse } from "../mcp-utilities";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { Patient } from "../utils/patient";
import { getPatientSex, getPatientAge, getPatientRace } from "../utils/patient-demographics";
import { getPatientCholesterol, getPatientHDL, getPatientSystolicBloodPressure } from "../utils/patient-vitals";
import { getPatientDiabetesStatus, getPatientSmokingStatus, getPatientHypertensionStatus } from "../utils/patient-conditions";
import calculateCVDRisk from "../utils/calculate-cvd-risk";

class CalculateCvdRiskTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "calculate_cvd_risk",
      "Calculates the cardiovascular disease (CVD) 10-year risk based on patient attributes (Sex, Age, Race, Total Cholesterol, HDL - Cholesterol, Systolic Blood Pressure, Diabetes status, Current Smoking status, Treatment for Hypertension status).",
      {
        patientId: z.string(),
        observationBundleId: z.string().optional(),
      },
      async ({ patientId, observationBundleId }) => {
        const fhirContext = getFhirContext(req);
        if (!fhirContext) {
          return createTextResponse(
            "A FHIR server url or token was not provided in the HTTP context.",
            { isError: true }
          );
        }
        const headers = {
          Authorization: `Bearer ${fhirContext.token}`,
        };

        // Get Patient resource
        const { data: patient } = await axios.get(
          `${fhirContext.url}/Patient/${patientId}`,
          { headers }
        );
        
        const observations = observationBundleId
        ? await getFhirBundle(fhirContext, observationBundleId)
        : await getObservationsByPatient(fhirContext, patientId);

        // Helper functions to parse fields
        const age = getPatientAge(patientResource);
        const gender = getPatientSex(patientResource);
        const race = getPatientRace(patientResource);
        const bmi = getBMIFromObservations(observations);
        const totalCholesterol = getPatientCholesterol(observations);
        const hdl = getPatientHDL(observations);
        const systolicBloodPressure = getPatientSystolicBloodPressure(observations);
        const conditions = {
          smoker: getPatientSmokingStatus(observations),
          diabetic: getPatientDiabetesStatus(observations),
          hypertensive: getPatientHypertensionStatus(observations),
        };
        
        const patient: Patient = {
          name: patientResource.name?.[0]?.text ?? "Unknown",
          age,
          gender,
          race,
          bmi,
          totalCholesterol,
          hdl,
          systolicBloodPressure,
          conditions,
        };

        const result = calculateCVDRisk(patient); // <- your imported function
        return createTextResponse(`Predicted risk score: ${result}`);
      }
    );
  }
}

export const CalculateCvdRiskToolInstance = new CalculateCvdRiskTool();

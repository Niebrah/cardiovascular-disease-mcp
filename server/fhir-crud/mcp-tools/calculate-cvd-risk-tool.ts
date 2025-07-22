import { z } from "zod";
import { getFhirContext, getPatientIdIfContextExists } from "../fhir-utilities";
import { createTextResponse } from "../mcp-utilities";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";

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
        const age = getAgeFromPatient(patient);
        const bmi = getBMIFromObservations(observations);
        const systolicBP = getBPFromObservations(observations);
        const smoker = getSmokingStatus(observations);
        const diabetic = getConditionStatus(observations, "diabetes");

        const input = {
          age,
          bmi,
          systolicBloodPressure: systolicBP,
          conditions: { smoker, diabetic, hypertensive: false },
          // other fields
        };

        const result = runRiskModel(input); // <- your imported function
        return createTextResponse(`Predicted risk score: ${result}`);
      }
    );
  }
}

export const CalculateCvdRiskToolInstance = new CalculateCvdRiskTool();

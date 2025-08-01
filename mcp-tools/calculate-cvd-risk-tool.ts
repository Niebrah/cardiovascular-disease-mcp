import { z } from "zod";
import {
  getFhirContext,
  getFhirResource,
  getPatientIdIfContextExists,
} from "../fhir-utilities";
import { createTextResponse } from "../mcp-utilities";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { Patient } from "../utils/patient";
import {
  getPatientSex,
  getPatientAge,
  getPatientRace,
  getPatientName,
} from "../utils/patient-demographics";
import {
  getPatientCholesterol,
  getPatientHDL,
  getPatientSystolicBloodPressure,
} from "../utils/patient-vitals";
import {
  getPatientDiabetesStatus,
  getPatientSmokingStatus,
  getPatientHypertensionStatus,
} from "../utils/patient-conditions";
import calculateCVDRisk from "../utils/calculate-cvd-risk";

class CalculateCvdRiskTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "calculate_cvd_risk",
      "Calculates the cardiovascular disease (CVD) 10-year risk based on the Pooled Cohort Equations and lifetime risk prediction tools.",
      {
        patientID: z.string(),
      },
      async ({ patientID }) => {
        console.log("mcp tool");
        const fhirContext = getFhirContext(req);
        if (!fhirContext) {
          console.log("no fhir context");
          return createTextResponse(
            "A FHIR server url or token was not provided in the HTTP context.",
            { isError: true }
          );
        }

        const patientIdContext = getPatientIdIfContextExists(req);
        const effectivePatientId = patientIdContext || patientID; // patientIdContext if exists, otherwise use patientID
        if (!effectivePatientId) {
          console.log("no patient ID");
          return createTextResponse(
            "No patient ID provided or found in context.",
            { isError: true }
          );
        }
        console.log("patient ID:", patientIdContext);

        const headers = {
          Authorization: `Bearer ${fhirContext.token}`,
        };

        // Get Patient resource (patient structure can be found on https://www.hl7.org/fhir/R4/patient.html)
        // FHIR Patient resource for retrieving patient demographics
        const { data: patientResource } = await axios.get(
          `${fhirContext.url}/Patient/${effectivePatientId}`,
          { headers }
        );

        // FHIR Observations for retrieving patient vitals and conditions
        const observations = await getFhirResource(
          fhirContext,
          "Observation",
          effectivePatientId
        )
          .then((res) => {
            if (!res.entry?.length) {
              return [];
            }
            return res.entry.map((x) => x.resource);
          })
          .catch((error) => {
            console.error("Error fetching observations:", error);
            return [];
          });

        const conditionsRes = await getFhirResource(
          fhirContext,
          "Condition",
          effectivePatientId
        )
          .then((res) => {
            if (!res.entry?.length) {
              return [];
            }
            return res.entry.map((x) => x.resource);
          })
          .catch((error) => {
            console.error("Error fetching conditions:", error);
            return [];
          });

        try {
          // Helper functions to parse fields
          const name = getPatientName(patientResource);
          const age = getPatientAge(patientResource);
          const gender = getPatientSex(patientResource);
          const race = getPatientRace(patientResource).join(", ");
          const totalCholesterol = getPatientCholesterol(observations);
          const hdl = getPatientHDL(observations);
          const systolicBloodPressure = getPatientSystolicBloodPressure(observations);
          const conditions = {
            smoker: getPatientSmokingStatus(observations),
            diabetic: getPatientDiabetesStatus(conditionsRes),
            hypertensive: getPatientHypertensionStatus(conditionsRes),
          };

          const patient: Patient = {
            name,
            age,
            gender,
            race,
            totalCholesterol,
            hdl,
            systolicBloodPressure,
            conditions,
          };

          const result = calculateCVDRisk(patient);
          if (result === null) {
            return createTextResponse(
              `The patient's age (${age}) is outside the valid range for CVD risk calculation (40-79 years).`,
              { isError: true }
            );
          }
          console.log("calculated risk:", result);
          return createTextResponse(
            `${name}'s predicted 10-year Cardiovascular Disease risk score: ${result}%.\n\n` +
            `**Attributes used:**\n` +
            `- Age: ${age}\n` +
            `- Sex: ${gender}\n` +
            `- Race: ${race}\n` +
            `- Total Cholesterol: ${totalCholesterol}\n` +
            `- HDL: ${hdl}\n` +
            `- Systolic Blood Pressure: ${systolicBloodPressure}\n` +
            `- Diabetic: ${conditions.diabetic}\n` +
            `- Smoker: ${conditions.smoker}\n` +
            `- Hypertensive: ${conditions.hypertensive}`,
            {
              metadata: {
                patientAttributesUsed: {
                  name,
                  age,
                  gender,
                  race,
                  totalCholesterol,
                  hdl,
                  systolicBloodPressure,
                  conditions,
                }
              }
            }
          );
        } catch (error) {
          console.error("Error", error);
          return createTextResponse("error occured" + error);
        }
      }
    );
  }
}

export const CalculateCvdRiskToolInstance = new CalculateCvdRiskTool();

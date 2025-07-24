import { z } from "zod";
import { getFhirContext, getFhirResource, getPatientIdIfContextExists } from "../fhir-utilities";
import { createTextResponse } from "../mcp-utilities";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { Patient } from "../utils/patient";
import { getPatientSex, getPatientAge, getPatientRace, getPatientName } from "../utils/patient-demographics";
import { getPatientCholesterol, getPatientHDL, getPatientSystolicBloodPressure, getPatientBMI } from "../utils/patient-vitals";
import { getPatientDiabetesStatus, getPatientSmokingStatus, getPatientHypertensionStatus } from "../utils/patient-conditions";
import calculateCVDRisk from "../utils/calculate-cvd-risk";

class CalculateCvdRiskTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "calculate_cvd_risk",
      "Calculates the cardiovascular disease (CVD) 10-year risk based on patient attributes (Sex, Age, Race, Total Cholesterol, HDL - Cholesterol, Systolic Blood Pressure, Diabetes status, Current Smoking status, Treatment for Hypertension status).",
      {
        patientID: z.string(),
        observationBundleId: z.string().optional(),
      },
      async ({ patientID }) => {
        const fhirContext = getFhirContext(req);
        if (!fhirContext) {
          return createTextResponse(
            "A FHIR server url or token was not provided in the HTTP context.",
            { isError: true }
          );
        }

        const patientIdContext = getPatientIdIfContextExists(req);
        const effectivePatientId = patientIdContext || patientID; // patientIdContext if exists, otherwise use patientID
        if (!effectivePatientId) {
          return createTextResponse(
            "No patient ID provided or found in context.",
            { isError: true }
          );
        }

        const headers = {
          Authorization: `Bearer ${fhirContext.token}`,
        }

        // Get Patient resource (patient structure can be found on https://www.hl7.org/fhir/R4/patient.html)
        // FHIR Patient resource for retrieving patient demographics
        const { data: patientResource } = await axios.get(
            `${fhirContext.url}/Patient/${patientID}`,
            { headers }
          );
        
        // FHIR Observations for retrieving patient vitals and conditions
        const observations = await getFhirResource(
          fhirContext,
          "Observation",
          patientID
        )
        .then((res) => {
          if (!res.entry?.length) {
            return null
          }

          return res.entry
            .map((x) => x.resource.code?.coding?.map((y) => y.display) || [])
            .reduce((a, b) => a.concat(b), []);
        })

        // Helper functions to parse fields
        const name = getPatientName(patientResource);
        const age = getPatientAge(patientResource);
        const gender = getPatientSex(patientResource);
        const race = getPatientRace(patientResource).join(", ");
        const bmi = getPatientBMI(observations);
        const totalCholesterol = getPatientCholesterol(observations);
        const hdl = getPatientHDL(observations);
        const systolicBloodPressure = getPatientSystolicBloodPressure(observations);
        const conditions = {
          smoker: getPatientSmokingStatus(observations),
          diabetic: getPatientDiabetesStatus(observations),
          hypertensive: getPatientHypertensionStatus(observations),
        };
        
        const patient: Patient = {
          name,
          age,
          gender,
          race,
          bmi,
          totalCholesterol,
          hdl,
          systolicBloodPressure,
          conditions,
        };

        const result = calculateCVDRisk(patient);
        // return createTextResponse(`Predicted 10-year Cardiovascular Disease risk score: ${result}`);
        return createTextResponse(patient.toString(), { isError: false });
      }
    );
  }
}

export const CalculateCvdRiskToolInstance = new CalculateCvdRiskTool();

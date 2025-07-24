import { z } from "zod";
import { getFhirContext, getFhirResource, getPatientIdIfContextExists } from "../fhir-utilities";
import { createTextResponse } from "../mcp-utilities";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { Patient } from "../utils/patient";
import { getPatientSex, getPatientAge, getPatientRace, getPatientName } from "../utils/patient-demographics";
import { getPatientCholesterol, getPatientHDL, getPatientSystolicBloodPressure } from "../utils/patient-vitals";
import { getPatientDiabetesStatus, getPatientSmokingStatus, getPatientHypertensionStatus } from "../utils/patient-conditions";

class GetPatientInfoTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_patient_info",
      "Returns patient demographic and vital attributes parsed from the FHIR server for testing purposes.",
      {
        patientID: z.string(),
      },
      async ({ patientID }) => {
        const fhirContext = getFhirContext(req);
        if (!fhirContext) {
          return createTextResponse("Missing FHIR context.", { isError: true });
        }

        const headers = {
          Authorization: `Bearer ${fhirContext.token}`,
        };

        const { data: patientResource } = await axios.get(
          `${fhirContext.url}/Patient/${patientID}`,
          { headers }
        );

        const observations = await getFhirResource(fhirContext, "Observation", patientID).then(
          (res) => res.entry?.map((x) => x.resource) ?? []
        );

        const patient: Patient = {
          name: getPatientName(patientResource),
          age: getPatientAge(patientResource),
          gender: getPatientSex(patientResource),
          race: getPatientRace(patientResource).join(", "),
          totalCholesterol: getPatientCholesterol(observations),
          hdl: getPatientHDL(observations),
          systolicBloodPressure: getPatientSystolicBloodPressure(observations),
          conditions: {
            smoker: getPatientSmokingStatus(observations),
            diabetic: getPatientDiabetesStatus(observations),
            hypertensive: getPatientHypertensionStatus(observations),
          },
        };

        return createTextResponse(`Patient object:\n${JSON.stringify(patient, null, 2)}`);
      }
    );
  }
}

export const GetPatientInfoToolInstance = new GetPatientInfoTool();

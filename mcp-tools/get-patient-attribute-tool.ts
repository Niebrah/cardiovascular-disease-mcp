import { z } from "zod";
import { getFhirContext, getPatientIdIfContextExists } from "../fhir-utilities";
import { createTextResponse } from "../mcp-utilities";
import axios from "axios";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { getPatientName, getPatientRace } from "../utils/patient-demographics";

class GetPatientAttributeTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_patient_attribute",
      "Retrieves a specific attribute (name, weight, height, race) from the patient's FHIR data.",
      {
        field: z
          .enum(["name", "weight", "height", "race"])
          .describe("The field to retrieve for the patient"),
      },
      async ({ field }) => {
        const fhirContext = getFhirContext(req);
        if (!fhirContext) {
          return createTextResponse(
            "A FHIR server url or token was not provided in the HTTP context.",
            { isError: true }
          );
        }

        const patientId = getPatientIdIfContextExists(req);
        if (!patientId) {
          return createTextResponse("No patient context found.", {
            isError: true,
          });
        }

        const headers = {
          Authorization: `Bearer ${fhirContext.token}`,
        };

        try {
          // Get Patient resource
          const { data: patient } = await axios.get(
            `${fhirContext.url}/Patient/${patientId}`,
            { headers }
          );

          // Switch by requested field
          switch (field) {
            case "name": {
              const name = getPatientName(patient);
              return createTextResponse(name);
            }

            case "race": {
              const race = getPatientRace(patient); // [White, Native American]
              return createTextResponse(race.join(", ") || "Race not found.");
            }

            case "height":
            case "weight": {
              const loincCode = field === "height" ? "8302-2" : "29463-7"; // height | weight
              const { data: observations } = await axios.get(
                `${fhirContext.url}/Observation?subject=Patient/${patientId}&code=${loincCode}`,
                { headers }
              );

              const entry = observations.entry?.[0]?.resource;
              const value = entry?.valueQuantity;
              if (!value) return createTextResponse(`${field} not found.`);
              return createTextResponse(`${value.value} ${value.unit}`);
            }

            default:
              return createTextResponse("Invalid field.", { isError: true });
          }
        } catch (err) {
          return createTextResponse(
            `An unexpected error occurred while attempting to retrieve the patient's ${field}.`,
            { isError: true }
          );
        }
      }
    );
  }
}

export const GetPatientAttributeToolInstance = new GetPatientAttributeTool();

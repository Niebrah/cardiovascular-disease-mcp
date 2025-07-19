import { IMcpTool } from "../IMcpTool";
import { z } from "zod";
import { createTextResponse } from "../mcp-utilities";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { getFhirContext, getPatientIdIfContextExists } from "../fhir-utilities";
import { Request } from "express";
import axios from "axios";

type BundleEntry = {
  resource: {
    id: string;
    code: {
      coding: {
        display: string;
      }[];
    };
  };
};

type Bundle = {
  entry: BundleEntry[];
};

export class GetFhirResourceTool implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_patient_fhir_resource", // name of tool
      "Finds the FHIR resource (EG: Patient, Encounter, Observation, etc.) of a patient" +
        "and returns it as an array. If patient context already exists, then the patient" +
        "ID is not required. Otherwise, the patient ID is required.",
      {
        patientID: z
          .string()
          .optional()
          .describe(
            "The patient id. Optional if patient context exists. Required otherwise."
          ),
        resourceType: z
          .string()
          .describe(
            "The FHIR resource type to retrieve (EG: Condition, Observation, etc.)." +
              "This should be a valid FHIR resource type."
          ),
      },
      async ({ patientID, resourceType }) => {
        // handler for tool
        const fhirContext = getFhirContext(req);
        if (!fhirContext) {
          return createTextResponse(
            "A FHIR server url or token was not provided in the HTTP context.",
            { isError: true }
          );
        }

        // if the patient has an ID, it can be supplied to the MCP server
        const patientIdContext = getPatientIdIfContextExists(req);
        if (!patientIdContext && !patientID) {
          // if patient ID is not provided and no context exists (LLM could not find ID)
          return createTextResponse(
            "No patient context found, an ID is required to fetch conditions.",
            { isError: true }
          );
        }

        const response = await axios.get<Bundle>(
          `${fhirContext.url}/${resourceType}?patient=${
            patientIdContext || patientID
          }`,
          {
            headers: {
              Authorization: `Bearer ${fhirContext.token}`,
            },
          }
        );

        if (!response.data.entry?.length) {
          return createTextResponse("No conditions found for the patient.", {
            isError: true,
          });
        }

        const displayValues = response.data.entry
          .map((x) => x.resource.code.coding.map((y) => y.display))
          .reduce((a, b) => a.concat(b), []);

        return createTextResponse(JSON.stringify(displayValues));
      }
    );
  }
}

export const GetFhirResourceToolInstance = new GetFhirResourceTool();

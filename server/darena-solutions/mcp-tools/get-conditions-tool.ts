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

export class GetConditionsTool implements IMcpTool {
  /*
    This function retrieves the conditions of a patient from a FHIR server.
    If the patient context already exists, it uses that context and sends it
    to the MCP server; otherwise, it requires a patient ID to fetch the
    conditions.
    */
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_patient_conditions", // name of tool
      "Finds the conditions of a patient and returns it as an array. If patient context " + // description for llm to recognize
        "already exists, then the patient ID is not required. Otherwise, the patient " +
        "ID is required.",
      {
        patientID: z
          .string()
          .optional()
          .describe(
            "The patient id. Optional if patient context exists. Required otherwise."
          ),
      },
      async ({ patientID }) => {
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
          `${fhirContext.url}/Condition?patient=${
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

export const GetConditionsToolInstance = new GetConditionsTool();

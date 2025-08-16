import { z } from "zod";
import { getFhirContext } from "../fhir-utilities";
import { createTextResponse } from "../mcp-utilities";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { fetchStudies } from "../utils/clinical-trials";

class GetClinicalTrials implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_clinical_trials",
      "Retrieves clinical trials with search query parameters.",
      {
        studies: z.string(),
      },
      async () => {
        const fhirContext = getFhirContext(req);
        if (!fhirContext) {
          return createTextResponse(
            "A FHIR server url or token was not provided in the http context.",
            { isError: true }
          );
        }

        const studies = await fetchStudies();
        return studies;
      }
    );
  }
}

export const GetClinicalTrialsInstance = new GetClinicalTrials();

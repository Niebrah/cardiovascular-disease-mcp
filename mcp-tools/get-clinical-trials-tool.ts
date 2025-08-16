import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { createTextResponse } from "../mcp-utilities";
import { fetchClinicalTrials } from "../utils/fetch-clinical-trials";

class GetClinicalTrials implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_clinical_trials",
      "Retrieves clinical trials studies with search query parameters.",
      {
        condition: z
          .string()
          .describe("The clinical trial condition listed in the study"),
      },
      async ({ condition }) => {
        try {
          // API call to ClinicalTrials.gov API
          const studies = await fetchClinicalTrials(condition);

          const studiesListedInfo = studies.map((s: any, idx: number) => {
            const title = s.protocolSection.identificationModule.briefTitle;
            const condition = s.protocolSection.conditionsModule?.conditions?.join(", ") || "No condition listed";
            return `${idx + 1}. ${title} [${condition}]\n`;
          });
          return createTextResponse("Clinical trials: \n" + studiesListedInfo);
        } catch (error) {
          console.error("Unexpected error:", error);
          return createTextResponse(
            "An error occurred while retrieving clinical trials." + error,
            { isError: true }
          );
        }
      }
    );
  }
}

export const GetClinicalTrialsInstance = new GetClinicalTrials();

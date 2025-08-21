import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../../IMcpTool";
import { createTextResponse } from "../../mcp-utilities";
import { studiesListedInfo } from "../utils/studies-listed-info";
import { fetchClinicalTrials } from "../utils/fetch-clinical-trials";

class GetClinicalTrialById implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_clinical_trials_by_id",
      "Retrieves a single clinical trial with search field parameters.",
      {
        nctID: z
          .string()
          .describe("The NCT ID of the clinical trial study"),
        searchField: z
          .string()
          .optional()
          .describe("The field to search in the clinical trial study (optional)"),
      },
      async ({ nctID, searchField }) => {
        try {
            // API call to ClinicalTrials.gov API (query params: https://clinicaltrials.gov/data-api/api)
            const args = {}
            const study = await fetchClinicalTrials(args, nctID);
            // TODO: parse through this study using searchField if provided
            let resultData;
                if (searchField && study) {
                  resultData = study[searchField] ?? `Field '${searchField}' not found in study data.`;
                } else {
                  // if no available study
                  const title = study?.briefTitle ?? "Title not available";
                  const status = study?.overallStatus ?? "Status not available";
                  const conditions = Array.isArray(study?.conditions) ? study.conditions.join(", ") : "Conditions not available";
                  const summary = study?.briefSummary ?? "Summary not available";

            // TODO: format the study information for LLM output
            resultData = `Title: ${title}\nStatus: ${status}\nConditions: ${conditions}\nSummary: ${summary}`;}
            return createTextResponse("");
        } catch (error) {
          console.error("Unexpected error:", error);
          return createTextResponse(
            "An error occurred while retrieving clinical trial with ID " + nctID + error,
            { isError: true }
          );
        }
      }
    );
  }
}

export const GetClinicalTrialByIdInstance = new GetClinicalTrialById();

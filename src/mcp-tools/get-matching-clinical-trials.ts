import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../../IMcpTool";
import { createTextResponse } from "../../mcp-utilities";
import { fetchClinicalTrials } from "../utils/fetch-clinical-trials";
import { studiesListedInfo } from "../utils/studies-listed-info";

class GetMatchingClinicalTrials implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_matching_clinical_trials",
      "Retrieves clinical trials studies with search query parameters based on a patient's attributes.",
      {
        condition: z
          .string()
          .describe("The clinical trial condition listed in the study"),
        location: z
          .string()
          .optional()
          .describe("The location of the clinical trial (optional)"),
      },
      async ({ condition, location }) => {
        try {
          // API call to ClinicalTrials.gov API (query params: https://clinicaltrials.gov/data-api/api)
          const args = {
            "query.cond": condition,
            "query.locn": location,
            "filter.overallStatus": "RECRUITING",
            // TODO: Add filters based on patient attributes
          }
          const studies = await fetchClinicalTrials(args);
          const formattedStudies = studiesListedInfo(studies);
          return createTextResponse("Clinical trials: \n" + formattedStudies);
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

export const GetMatchingClinicalTrialsInstance = new GetMatchingClinicalTrials();

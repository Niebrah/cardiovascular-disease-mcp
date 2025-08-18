import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../../IMcpTool";
import { createTextResponse } from "../../mcp-utilities";
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
        location: z
          .string()
          .optional()
          .describe("The location of the clinical trial (optional)"),
      },
      async ({ condition, location }) => {
        try {
          // API call to ClinicalTrials.gov API (query params: https://clinicaltrials.gov/data-api/api)
          // const fields = [
          //   "protocolSection.identificationModule.briefTitle",
          //   "protocolSection.conditionsModule.conditions",
          // ]
          const args = {
            "query.cond": condition,
            "query.locn": location,
            "filter.overallStatus": "RECRUITING",
            // "filter.advanced": "AREA[PrimaryCompletionDate]RANGE[MIN, 2025]",
            // "fields": fields.join(","),
          }
          const studies = await fetchClinicalTrials(args);

          const studiesListedInfo = studies.slice(0,5).map((s: any, idx: number) => {
            const NCTId = s.protocolSection.identificationModule.nctId || null;
            const nctIdLink = NCTId ? `https://clinicaltrials.gov/study/${NCTId}` : "n/a";
            const title = s.protocolSection.identificationModule?.briefTitle || "untitled study";
            const conditions = s.protocolSection.conditionsModule?.conditions?.join(", ") || "n/a";
            const overallStatus = s.protocolSection.statusModule.overallStatus || "n/a";
            const locationCountry = s.protocolSection.contactsLocationsModule.locations?.country || "n/a";
            const locationState = s.protocolSection.contactsLocationsModule.locations?.state || "n/a";
            const leadSponsor = s.protocolSection.sponsorCollaboratorsModule.leadSponsor?.name || "n/a";
            const startDate = s.protocolSection.statusModule.startDateStruct.date || "n/a";
            const completionDate = s.protocolSection.statusModule.primaryCompletionDateStruct?.date || "n/a";
            // const eligibilityCriteria = s.protocolSection.eligibilityModule?.eligibilityCriteria || "n/a";
            return (`${idx + 1}. ${title} [${overallStatus}]\n
              - Conditions: ${conditions}\n
              - Location: ${locationCountry}, ${locationState}\ns
              - Lead Sponsor: ${leadSponsor}\n
              - Duration: ${startDate} - ${completionDate}\n
              - More Info: ${nctIdLink}\n
            `);
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

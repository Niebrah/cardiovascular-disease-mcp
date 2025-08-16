import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { createTextResponse } from "../mcp-utilities";
import axios from "axios";

const CLINICAL_TRIALS_API_URL = "https://clinicaltrials.gov/api/v2";

class GetClinicalTrials implements IMcpTool {
  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_clinical_trials",
      "Retrieves clinical trials studies with search query parameters.",
      async () => {
        try {
          const res = await axios.get(`${CLINICAL_TRIALS_API_URL}/studies`);
          const studies = res.data.studies;
          const studiesListedInfo = studies.map((s: any, idx: number) => {
            const title = s.protocolSection.identificationModule.briefTitle;
            const condition = s.protocolSection.conditionsModule?.conditions?.join(", ") || "No condition listed";
            return `${idx + 1}. ${title} [${condition}]`;
          });
          console.log(studiesListedInfo);
          return createTextResponse("Clinical trials: \n" + studiesListedInfo);
        } catch (error) {
          console.error("Unexpected error:", error);
          return createTextResponse(
            "An error occurred while retrieving clinical trials." + error,
            { isError: true }
          );
          throw error;
        }
      }
    );
  }
}

export const GetClinicalTrialsInstance = new GetClinicalTrials();

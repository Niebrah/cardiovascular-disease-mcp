import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../../IMcpTool";
import { createTextResponse } from "../../mcp-utilities";
import faqData from "../data/faq-data.json";
import Fuse from "fuse.js";

interface FaqEntry {
  question: string;
  answer: string;
}

class GetFaq implements IMcpTool {
  private faqData: FaqEntry[] = faqData;

  private fuse: Fuse<FaqEntry>;

  constructor() {
    this.fuse = new Fuse(this.faqData, {
      keys: ["question"],
      threshold: 0.4,
    });
  }

  registerTool(server: McpServer, req: Request) {
    server.tool(
      "get_faq",
      "Returns answers to frequently asked questions about clinical trials.",
      {
        question: z.string().describe("The question you want answered."),
      },
      async ({ question }) => {
        if (this.faqData.length === 0) {
          return createTextResponse(
            "FAQ data is not available right now.",
            { isError: true }
          );
        }

        // Normalize input
        const normalized = question.toLowerCase();

        // Exact match first
        const exactMatch = this.faqData.find(
          (f) => f.question.toLowerCase() === normalized
        );
        if (exactMatch) {
          return createTextResponse(`Q: ${exactMatch.question}\nA: ${exactMatch.answer}`);
        }

        // Fuzzy/partial match
        const results = this.fuse.search(normalized);

        if (results.length > 0) {
          const best = results[0].item;
          return createTextResponse(
            `Q: ${best.question}\nA: ${best.answer}`
          );
        }

        return createTextResponse(
          `No FAQ found for: "${question}". Try another question.`,
          { isError: true }
        );
      }
    );
  }
}

export const GetFaqInstance = new GetFaq();

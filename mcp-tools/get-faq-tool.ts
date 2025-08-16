import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { Request } from "express";
import { IMcpTool } from "../IMcpTool";
import { createTextResponse } from "../mcp-utilities";
import * as path from "path";
import * as fs from "fs";

// Define FAQ type
interface FaqEntry {
  question: string;
  answer: string;
}

class GetFaq implements IMcpTool {
  private faqData: FaqEntry[] = [];

  constructor() {
    this.loadFaqData();
  }

  private loadFaqData() {
    try {
      const faqPath = path.resolve(__dirname, "../../static/faq-data.json");
      const faqRaw = fs.readFileSync(faqPath, "utf-8");
      this.faqData = JSON.parse(faqRaw);
    } catch (error) {
      console.error("Error loading FAQ data:", error);
      this.faqData = [];
    }
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
        const partialMatches = this.faqData.filter((f) =>
          f.question.toLowerCase().includes(normalized)
        );

        if (partialMatches.length > 0) {
          const suggestions = partialMatches
            .map((f) => `- ${f.question}`)
            .join("\n");
          return createTextResponse(
            `I couldn't find an exact match, but here are similar questions:\n${suggestions}`
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

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import express from "express";
import * as tools from "./src/mcp-tools";
import { IMcpTool } from "./IMcpTool";
import { debugTool } from "./src/utils/debug";

const app = express();
const port = 5000;

app.use(express.json());

app.get("/", async (_, res) => {
  res.status(200).send("Server is up & running!");
});

app.post("/", async (req, res) => {
  try {
    const server = new McpServer({
      name: "CVD Risk Calculator MCP Server",
      version: "1.0.0",
    });

    // Loops through all tools in mcp-tools
    for (const tool of Object.values<IMcpTool>(tools)) {
      tool.registerTool(server, req);
    }

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    res.on("close", () => {
      console.log("Request closed");

      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.log("Error handling MCP request:", error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error",
        },
        id: null,
      });
    }
  }
});

app.listen(port, () => {
  console.log(`MCP server listening on port ${port}`);

  // DEBUG
  // debugTool("get_clinical_trials", { condition: "cardiovascular disease", location: "US" });
  // debugTool("get_faq", { question: "What is a clinical trial?" });
});

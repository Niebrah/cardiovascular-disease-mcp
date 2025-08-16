import axios from "axios";

export async function debugTool(tool: string, ...args: any[]) {
  const res = await axios.post(
    "http://localhost:5000/",
    {
      jsonrpc: "2.0",
      id: "1",
      method: "tools/call",
      params: {
        name: tool,
        arguments: args
      }
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream"
      }
    }
  );

  console.log(`Tool response (${tool}): \n`, JSON.stringify(res.data, null, 2));
}
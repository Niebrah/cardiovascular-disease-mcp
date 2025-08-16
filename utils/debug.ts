import axios from "axios";

export async function debugTool() {
  const res = await axios.post(
    "http://localhost:5000/",
    {
      jsonrpc: "2.0",
      id: "1",
      method: "tools/call",
      params: {
        name: "get_clinical_trials",
        arguments: {}
      }
    },
    {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream"
      }
    }
  );

  console.log("Tool response:", res.data);
}

export const mcpServerConfig = {
  tools: [
    {
      name: "predict_risk_score",
      description: "Predicts a 1-5 risk score for ASCVD based on patient data.",
      file: "https://github.com/jamesvdinh/cardiovascular-disease-mcp/blob/main/model/risk_score.ts",
    },
  ],
  context: [
    {
      type: "repo",
      url: "https://github.com/jamesvdinh/cardiovascular-disease-mcp",
      includeFiles: ["README.md", "model/risk_score.ts"],
    },
  ],
};

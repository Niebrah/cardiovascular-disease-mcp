export const mcpServerConfig = {
  tools: [
    {
      name: "predict_risk_score",
      description: "Predicts a 1-5 risk score for ASCVD based on patient data.",
      file: "https://github.com/jamesdinh/ascvd-risk-calculator/blob/main/model/risk_score.py",
    },
  ],
  context: [
    {
      type: "repo",
      url: "https://github.com/jamesdinh/ascvd-risk-calculator",
      includeFiles: ["README.md", "model/risk_score.py"],
    },
  ],
};

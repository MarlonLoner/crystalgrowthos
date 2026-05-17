export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  return {
    apiKeyConfigured: true
  };
}

export async function getStrategyRecommendationsPlaceholder() {
  const client = getOpenAIClient();

  if (!client) {
    return [
      "Prioritize the Cobalt Tech launch merchandise opportunity. It has the largest projected deal value and is still early enough to shape the offer.",
      "Send quote follow-ups to Northstar Fitness and Apex Legal Africa today because both have near-term follow-up dates.",
      "Turn reusable shopper bag objections into a re-engagement content angle for retail leads before Q3 budgets reopen."
    ];
  }

  return [
    "OpenAI integration is configured. Replace this placeholder with a business-data prompt when production data access is approved."
  ];
}

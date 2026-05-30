const read = (key: string, fallback = "") => process.env[key] ?? fallback;

export const env = {
  nodeEnv: read("NODE_ENV", "development"),
  databaseUrl: process.env.DATABASE_URL,
  nextAuthSecret: read("NEXTAUTH_SECRET", "launchly-dev-secret"),
  nextAuthUrl: process.env.NEXTAUTH_URL,
  githubId: process.env.GITHUB_ID,
  githubSecret: process.env.GITHUB_SECRET,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: read("OPENAI_MODEL", "gpt-4o"),
  pixverseApiKey: process.env.PIXVERSE_API_KEY,
  pixverseBaseUrl: read("PIXVERSE_BASE_URL", "https://app-api.pixverse.ai"),
  s3BaseUrl: process.env.S3_BASE_URL,
  demoMode: read("DEMO_MODE", "true") === "true",
};

export const flags = {
  hasDatabase: Boolean(env.databaseUrl),
  hasOpenAi: Boolean(env.openAiApiKey),
  hasPixverse: Boolean(env.pixverseApiKey),
  hasGitHubAuth: Boolean(env.githubId && env.githubSecret),
  isDemoMode: env.demoMode || !env.databaseUrl,
};

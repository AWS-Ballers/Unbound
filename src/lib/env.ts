const read = (key: string, fallback = "") => process.env[key] ?? fallback;

const readBool = (key: string, fallback: boolean) => {
  const value = process.env[key];
  if (value === undefined) {
    return fallback;
  }
  return value === "true" || value === "1";
};

const readInt = (key: string, fallback: number) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

/** Direct Postgres URLs work with Prisma's library engine; prisma:// is for Accelerate. */
export function isDirectPostgresDatabaseUrl(url: string | undefined) {
  if (!url) {
    return false;
  }
  return url.startsWith("postgresql://") || url.startsWith("postgres://");
}

export const env = {
  nodeEnv: read("NODE_ENV", "development"),
  databaseUrl: process.env.DATABASE_URL,
  nextAuthSecret:
    process.env.AUTH_SECRET ?? read("NEXTAUTH_SECRET", "launchly-dev-secret-change-me"),
  nextAuthUrl: process.env.NEXTAUTH_URL,
  githubId: process.env.GITHUB_ID,
  githubSecret: process.env.GITHUB_SECRET,
  githubToken: process.env.GITHUB_TOKEN,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: read("OPENAI_MODEL", "gpt-4o"),
  pixverseApiKey: process.env.PIXVERSE_API_KEY,
  pixverseBaseUrl: read("PIXVERSE_BASE_URL", "https://app-api.pixverse.ai"),
  pixverseCliPath: read("PIXVERSE_CLI_PATH", "pixverse"),
  pixverseCliEnabled: readBool("PIXVERSE_CLI_ENABLED", false),
  pixverseCliTimeoutMs: readInt("PIXVERSE_CLI_TIMEOUT_MS", 600_000),
  pixverseImageModel: process.env.PIXVERSE_IMAGE_MODEL,
  pixverseImageQuality: process.env.PIXVERSE_IMAGE_QUALITY,
  pixverseVideoModel: process.env.PIXVERSE_VIDEO_MODEL,
  pixversePersistAssets: readBool("PIXVERSE_PERSIST_ASSETS", true),
  s3BaseUrl: process.env.S3_BASE_URL,
  /** Explicit opt-in only. When DATABASE_URL is set, default is production (persisted data). */
  demoMode: readBool("DEMO_MODE", false),
};

export const flags = {
  hasDatabase: isDirectPostgresDatabaseUrl(env.databaseUrl),
  hasOpenAi: Boolean(env.openAiApiKey),
  hasPixverse: Boolean(env.pixverseApiKey),
  hasPixverseCli: env.pixverseCliEnabled,
  hasGitHubAuth: Boolean(env.githubId && env.githubSecret),
  hasGitHubToken: Boolean(env.githubToken),
  /** In-memory mock data when there is no direct Postgres URL, or DEMO_MODE is explicitly true. */
  isDemoMode: !isDirectPostgresDatabaseUrl(env.databaseUrl) || env.demoMode,
  usesPixverseCli: env.pixverseCliEnabled && !env.pixverseApiKey,
};

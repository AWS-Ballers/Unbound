import { env } from "@/lib/env";

export type GitHubRepoInspection = {
  owner: string;
  repo: string;
  fullName: string;
  url: string;
  description: string | null;
  defaultBranch: string;
  homepage: string | null;
  language: string | null;
  stars: number;
  readmeExcerpt: string;
  tree: Array<{ path: string }>;
  files: Array<{ path: string; content: string }>;
  stats: {
    totalFilesInTree: number;
    indexedFiles: number;
  };
};

const CODEBASE_PATH =
  /(^README|^docs\/|^src\/|^app\/|^pages\/|^components\/|^lib\/|^server\/|^api\/|package\.json$|pnpm-lock|yarn\.lock|tsconfig|next\.config|prisma\/|\.env\.example|Dockerfile|go\.mod|Cargo\.toml|pyproject\.toml|requirements\.txt)/i;

const MAX_TREE_PATHS = 250;
const MAX_INDEX_FILES = 24;
const MAX_FILE_CHARS = 4000;
const MAX_README_CHARS = 6000;

export function parseRepoUrl(url: string) {
  const trimmed = url.trim();
  const match = trimmed.match(/github\.com\/([^/]+)\/([^/?#]+)/i);
  if (!match) {
    throw new Error("Enter a valid GitHub repository URL (https://github.com/owner/repo)");
  }

  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/i, ""),
  };
}

function buildHeaders(accessToken?: string | null): HeadersInit {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Launchly",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const token = accessToken ?? env.githubToken;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function githubFetch(url: string, accessToken?: string | null) {
  const response = await fetch(url, { headers: buildHeaders(accessToken), cache: "no-store" });

  if (response.status === 404) {
    throw new Error("Repository not found. Check the URL or connect GitHub sign-in for private repos.");
  }

  if (response.status === 403) {
    throw new Error("GitHub rate limit reached. Sign in with GitHub or add GITHUB_TOKEN to your environment.");
  }

  if (!response.ok) {
    throw new Error("Unable to reach GitHub. Try again in a moment.");
  }

  return response;
}

function rankCodebasePaths(paths: string[]) {
  return [...paths].sort((a, b) => {
    const score = (path: string) => {
      if (/^README/i.test(path)) return 0;
      if (/package\.json$/i.test(path)) return 1;
      if (/^src\//i.test(path) || /^app\//i.test(path)) return 2;
      if (/^lib\//i.test(path) || /^components\//i.test(path)) return 3;
      return 4;
    };
    return score(a) - score(b) || a.localeCompare(b);
  });
}

function selectIndexPaths(allPaths: string[]) {
  const candidates = rankCodebasePaths(allPaths.filter((path) => CODEBASE_PATH.test(path)));
  return candidates.slice(0, MAX_INDEX_FILES);
}

async function fetchFileContents(
  owner: string,
  repo: string,
  branch: string,
  paths: string[],
  accessToken?: string | null,
) {
  return Promise.all(
    paths.map(async (path) => {
      const fileResponse = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`,
        { headers: buildHeaders(accessToken), cache: "no-store" },
      );
      const content = fileResponse.ok
        ? (await fileResponse.text()).slice(0, MAX_FILE_CHARS)
        : "";

      return { path, content };
    }),
  );
}

export async function inspectGitHubRepository(
  url: string,
  accessToken?: string | null,
): Promise<GitHubRepoInspection> {
  const { owner, repo } = parseRepoUrl(url);
  const repoResponse = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    accessToken,
  );
  const repoJson = await repoResponse.json();
  const defaultBranch = repoJson.default_branch ?? "main";

  const [readmeResponse, treeResponse] = await Promise.all([
    fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/README.md`, {
      headers: buildHeaders(accessToken),
      cache: "no-store",
    }),
    githubFetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
      accessToken,
    ),
  ]);

  const readme = readmeResponse.ok ? (await readmeResponse.text()).slice(0, MAX_README_CHARS) : "";
  const treeJson = await treeResponse.json();
  const blobPaths: string[] = (treeJson.tree ?? [])
    .filter((item: { path?: string; type?: string }) => item.type === "blob" && item.path)
    .map((item: { path: string }) => item.path);

  const indexPaths = selectIndexPaths(blobPaths);
  const files = (await fetchFileContents(owner, repo, defaultBranch, indexPaths, accessToken)).filter(
    (file) => file.content.length > 0,
  );

  return {
    owner,
    repo,
    fullName: repoJson.full_name ?? `${owner}/${repo}`,
    url: repoJson.html_url ?? `https://github.com/${owner}/${repo}`,
    description: repoJson.description ?? null,
    defaultBranch,
    homepage: repoJson.homepage ?? null,
    language: repoJson.language ?? null,
    stars: repoJson.stargazers_count ?? 0,
    readmeExcerpt: readme,
    tree: blobPaths.slice(0, MAX_TREE_PATHS).map((path) => ({ path })),
    files,
    stats: {
      totalFilesInTree: blobPaths.length,
      indexedFiles: files.length,
    },
  };
}

export function buildGitHubSourceContent(inspection: GitHubRepoInspection) {
  return [
    `# ${inspection.fullName}`,
    inspection.description ?? "",
    inspection.readmeExcerpt,
    "",
    `BRANCH: ${inspection.defaultBranch}`,
    `LANGUAGE: ${inspection.language ?? "unknown"}`,
    "",
    "INDEXED FILES:",
    ...inspection.files.map((file) => `## ${file.path}\n${file.content}`),
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildGitHubSourceMetadata(inspection: GitHubRepoInspection) {
  return {
    connector: "github",
    owner: inspection.owner,
    repo: inspection.repo,
    fullName: inspection.fullName,
    branch: inspection.defaultBranch,
    language: inspection.language,
    stars: inspection.stars,
    stats: inspection.stats,
    treePreview: inspection.tree.slice(0, 80).map((item) => item.path),
    indexedPaths: inspection.files.map((file) => file.path),
    inspectedAt: new Date().toISOString(),
  };
}

/** @deprecated Use inspectGitHubRepository */
export async function fetchGitHubSource(url: string) {
  const inspection = await inspectGitHubRepository(url);
  return {
    name: inspection.repo,
    description: inspection.description,
    readme: inspection.readmeExcerpt,
    homepage: inspection.homepage,
    files: inspection.files,
  };
}

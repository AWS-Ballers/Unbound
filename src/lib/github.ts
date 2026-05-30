type GitHubRepoInfo = {
  name: string;
  description: string | null;
  readme: string;
  homepage: string | null;
};

function parseRepoUrl(url: string) {
  const match = url.match(/github\.com\/(.+?)\/(.+?)(?:$|\.git|\/)/i);
  if (!match) {
    throw new Error("Invalid GitHub repository URL");
  }

  return {
    owner: match[1],
    repo: match[2],
  };
}

export async function fetchGitHubSource(url: string): Promise<GitHubRepoInfo> {
  const { owner, repo } = parseRepoUrl(url);
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
    "User-Agent": "Launchly",
  };

  const [repoResponse, readmeResponse] = await Promise.all([
    fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers, cache: "no-store" }),
    fetch(`https://raw.githubusercontent.com/${owner}/${repo}/HEAD/README.md`, {
      headers,
      cache: "no-store",
    }),
  ]);

  if (!repoResponse.ok) {
    throw new Error("Unable to fetch repository metadata from GitHub");
  }

  const repoJson = await repoResponse.json();
  const readme = readmeResponse.ok ? await readmeResponse.text() : "";

  return {
    name: repoJson.name,
    description: repoJson.description,
    readme,
    homepage: repoJson.homepage,
  };
}

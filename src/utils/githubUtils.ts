import axios from "axios";

export type GitHubRepo = {
  owner: string;
  name: string;
}

export function parseGitHubUrl(url: string): GitHubRepo {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/?/);

  if (!match) {
    throw new Error('Invalid GitHub URL');
  }

  const [, owner, name] = match;
  return { owner, name };
}

export async function getPrimaryBranch(repo: GitHubRepo) {
  try {
    await axios.head(getDownloadUrl(repo, 'master'));
    return 'master';
  } catch (e) {
    return 'main';
  }
}

export function getDownloadUrl(repo: GitHubRepo, branch: string) {
  return `https://github.com/${repo.owner}/${repo.name}/archive/refs/heads/${branch}.zip`
}
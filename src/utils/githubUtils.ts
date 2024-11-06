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
    const { data } = await axios.get(`https://github.com/${repo.owner}/${repo.name}`);
    const matches = data.match(/"defaultBranch": *"([^"]+)"/);
    return matches ? matches[1] : 'main';
  } catch (e) {
    return 'main';
  }
}

export function getDownloadUrl(repo: GitHubRepo, branch: string) {
  return `https://github.com/${repo.owner}/${repo.name}/archive/refs/heads/${branch}.zip`
}
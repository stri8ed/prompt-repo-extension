import RepoFileProvider from "@/core/RepoFileProvider.ts";
import fileListReducer from "@/core/fileListReducer.ts";
import {addMessageListener} from "@/utils/messaging.ts";
import {RequestType} from "@/types.ts";
import {getDownloadUrl, getPrimaryBranch, parseGitHubUrl} from "@/utils/githubUtils.ts";

const repoExtractors = new Map<string, RepoFileProvider>();

async function getRepoUrl(url: string) {
  const repo = parseGitHubUrl(url);
  const branch = await getPrimaryBranch(repo);
  return getDownloadUrl(repo, branch);
}

async function downloadRepo(url: string) {
  const repoUrl = await getRepoUrl(url);
  const extractor = new RepoFileProvider(repoUrl);
  repoExtractors.set(url, extractor);
  await extractor.loadContents();
  return extractor;
}

addMessageListener(RequestType.LoadRepo, async ({ url }, sender) => {
  let extractor = repoExtractors.get(url);
  if(!extractor) {
    extractor = await downloadRepo(url);
  }
  const files = await extractor.getTextFileInfo();
  return { files };
});

addMessageListener(RequestType.CompilePrompt, async ({ fileNames, url }, sender) => {
  let extractor = repoExtractors.get(url);
  if(!extractor) {
    extractor = await downloadRepo(url);
  }
  const entries = await extractor.getEntries();
  const filteredEntries = entries.filter(e => fileNames.includes(e.filename));
  const contents = await extractor.getFileContents(filteredEntries);
  return fileListReducer(contents);
});

addMessageListener(RequestType.KeepAlive, async ({ url }, _) => {
  if(!repoExtractors.has(url)) {
    await downloadRepo(url);
  }
  return {};
})


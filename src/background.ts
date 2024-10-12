import RepoExtractor from "@/core/RepoExtractor.ts";
import fileListReducer from "@/core/fileListReducer.ts";
import {addMessageListener} from "@/utils/messaging.ts";
import {RequestType} from "@/types.ts";
import {getDownloadUrl, getPrimaryBranch, parseGitHubUrl} from "@/utils/githubUtils.ts";

const repoExtractors = new Map<string, RepoExtractor>();
const testing = false;

async function getRepoUrl(url: string) {
  if(testing) {
    return chrome.runtime.getURL('example.zip');
  }
  const repo = parseGitHubUrl(url);
  const branch = await getPrimaryBranch(repo);
  return getDownloadUrl(repo, branch);
}

addMessageListener(RequestType.LoadRepo, async ({ url }, sender) => {
  const repoUrl = await getRepoUrl(url);
  let extractor = repoExtractors.get(url);
  if(!extractor) {
    extractor = new RepoExtractor(repoUrl);
    repoExtractors.set(url, extractor);
    await extractor.loadContents();
  }
  const files = await extractor.getTextFileInfo();
  return { files };
});

addMessageListener(RequestType.CompilePrompt, async ({ fileNames, url }, sender) => {
  const extractor = repoExtractors.get(url);
  if(!extractor) {
    throw new Error('No repo loaded');
  }
  const entries = await extractor.getEntries();
  const filteredEntries = entries.filter(e => fileNames.includes(e.filename));
  const contents = await extractor.getFileContents(filteredEntries);
  const text = fileListReducer(contents);
  return { compiledText: text };
});

addMessageListener(RequestType.Ping, async ({}, _) => {
  return { pong: 'pong' };
})


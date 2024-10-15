import {FileInfo, RequestType} from "@/types.ts";
import { sendMessage } from "@/utils/messaging.ts";
import LocalFileProvider from "@/core/LocalFileProvider.ts";
import fileListReducer from "@/core/fileListReducer.ts";
import {getMimeType} from "@zip.js/zip.js";

export type FileProvider = {
  files: FileInfo[],
  compilePrompt: (fileNames: string[]) => Promise<{ root: string, content: string }>
}

export type FileProviderType = 'repo' | 'filesystem';

export async function createFileProvider(
  type: FileProviderType,
  source: string | FileSystemDirectoryHandle
): Promise<FileProvider> {
  if (type === 'repo') {
    const { files } = await sendMessage(RequestType.LoadRepo, { url: source as string });
    return {
      files,
      compilePrompt: (fileNames: string[]) => sendMessage(RequestType.CompilePrompt, { fileNames, url: source as string })
    };
  } else {
    const extractor = new LocalFileProvider();
    await extractor.loadContents(source as FileSystemDirectoryHandle);
    const files = await extractor.getTextFileInfo();
    return {
      files,
      async compilePrompt(fileNames: string[]) {
        const contents = await extractor.getFileContents(fileNames);
        return fileListReducer(contents);
      }
    };
  }
}
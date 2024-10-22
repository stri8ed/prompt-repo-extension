
declare global {
  interface ImportMeta {
    readonly env: {
      MODE: 'development' | 'production';
    }
  }
}

export enum RequestType {
  LoadRepo = 'load-repo',
  CompilePrompt = 'compile-prompt',
  KeepAlive = 'keep-alive',
}

export type FileInfo = {
  name: string;
  byteLength: number;
}

export interface MessageMap {
  [RequestType.LoadRepo]: {
    request: { url: string };
    response: { files: FileInfo[] };
  };
  [RequestType.CompilePrompt]: {
    request: { fileNames: string[], url: string };
    response: { content: string, root: string };
  };
  [RequestType.KeepAlive]: {
    request: { url: string };
    response: {};
  };
}
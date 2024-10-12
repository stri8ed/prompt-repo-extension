
export enum RequestType {
  LoadRepo = 'load-repo',
  CompilePrompt = 'compile-prompt',
  Ping = 'ping',
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
    response: { compiledText: string };
  };
  [RequestType.Ping]: {
    request: {};
    response: { pong: string };
  };
}
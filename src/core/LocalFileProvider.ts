import { FileInfo } from "@/types.ts";
import {isTextFile} from "@/utils/fileUtils.ts";

const EXCLUDE_DIRS = ['node_modules', 'bin', 'vendor'];

export default class LocalFileProvider {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private rootName: string = '';

  public async loadContents(directoryHandle: FileSystemDirectoryHandle) {
    this.rootHandle = directoryHandle;
    this.rootName = directoryHandle.name;
    return this;
  }

  public async getTextFileInfo(): Promise<FileInfo[]> {
    if (!this.rootHandle) throw new Error("No directory loaded");

    const fileInfos: FileInfo[] = [];
    await this.traverseDirectory(this.rootHandle, "", fileInfos);
    return fileInfos;
  }

  private async traverseDirectory(
    dirHandle: FileSystemDirectoryHandle,
    path: string,
    fileInfos: FileInfo[]
  ) {
    for await (const [name, handle] of dirHandle.entries()) {
      const entryPath = path ? `${path}/${name}` : name;
      const fullPath = `${this.rootName}/${entryPath}`;

      if (handle.kind === "file") {
        const file = await handle.getFile();
        if (isTextFile(entryPath)) {
          fileInfos.push({
            name: fullPath,
            byteLength: file.size
          });
        }
      } else if (handle.kind === "directory") {
        // Check if the directory is in the root and should be excluded
        if (path === "" && EXCLUDE_DIRS.includes(name)) {
          continue;
        }
        await this.traverseDirectory(handle, entryPath, fileInfos);
      }
    }
  }

  public async getFileContents(fileNames: string[]): Promise<{ [fileName: string]: string }> {
    if (!this.rootHandle) throw new Error("No directory loaded");

    const contents: { [fileName: string]: string } = {};
    for (const fileName of fileNames) {
      const fileHandle = await this.getFileHandle(fileName);
      if (fileHandle) {
        const file = await fileHandle.getFile();
        contents[fileName] = await file.text();
      }
    }
    return contents;
  }

  private async getFileHandle(path: string): Promise<FileSystemFileHandle | null> {
    const parts = path.split('/');
    // Remove the root directory name from the path
    if (parts[0] === this.rootName) {
      parts.shift();
    }

    let currentHandle: FileSystemDirectoryHandle = this.rootHandle!;

    for (let i = 0; i < parts.length - 1; i++) {
      if (i === 0 && EXCLUDE_DIRS.includes(parts[i])) {
        return null;
      }
      currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
    }

    try {
      return await currentHandle.getFileHandle(parts[parts.length - 1]);
    } catch {
      return null;
    }
  }
}
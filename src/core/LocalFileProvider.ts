import { FileInfo } from "@/types.ts";
import {isTextFile} from "@/utils/fileUtils.ts";

const EXCLUDE_DIRS = [
  'node_modules',
  'bin',
  'vendor',
  '.git',
  'vendor',
  'venv',
  'site-packages'
];

export default class LocalFileProvider {
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private rootName: string = '';
  private gitignorePatterns: string[] = [];

  public async loadContents(directoryHandle: FileSystemDirectoryHandle) {
    this.rootHandle = directoryHandle;
    this.rootName = directoryHandle.name;

    try {
      const gitignoreHandle = await directoryHandle.getFileHandle('.gitignore');
      const gitignoreFile = await gitignoreHandle.getFile();
      const gitignoreContent = await gitignoreFile.text();
      this.gitignorePatterns = this.parseGitignore(gitignoreContent);
    } catch (error) {
      this.gitignorePatterns = [];
    }
    
    return this;
  }

  private parseGitignore(content: string): string[] {
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
      .map(pattern => {
        let processedPattern = pattern;

        if (processedPattern.endsWith('/')) {
          processedPattern = processedPattern.slice(0, -1);
        }

        if (processedPattern.startsWith('/')) {
          processedPattern = processedPattern.substring(1);
        }
        
        return processedPattern;
      });
  }

  private isIgnored(path: string): boolean {
    if (!path) return false;

    const normPath = path.replace(/\\/g, '/');
    const pathParts = normPath.split('/');

    if (pathParts.length > 0 && EXCLUDE_DIRS.includes(pathParts[0])) {
      return true;
    }

    for (const pattern of this.gitignorePatterns) {
      if (normPath === pattern) return true;

      // Convert gitignore pattern to regex pattern
      const regexPattern = pattern
          .replace(/\./g, '\\.')
          .replace(/\*/g, '.*');

      if (pattern.includes('/')) {
        // Pattern with slashes must match from the project root
        // Create a regex that matches the entire path
        const regex = new RegExp(`^${regexPattern}($|/.*$)`);
        if (regex.test(normPath)) {
          return true;
        }
      } else {
        // Patterns without slashes can match any part of the path
        if (pathParts.includes(pattern)) {
          return true;
        }

        // For wildcard patterns, check if any part matches
        if (pattern.includes('*')) {
          const regex = new RegExp(`^${regexPattern}$`);
          if (pathParts.some(part => regex.test(part))) {
            return true;
          }
        }
      }
    }

    return false;
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
      
      // Skip if the path matches gitignore patterns
      if (this.isIgnored(entryPath)) {
        continue;
      }
      
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

    // Check if the path is in an ignored directory
    if (this.isIgnored(parts.join('/'))) {
      return null;
    }

    let currentHandle: FileSystemDirectoryHandle = this.rootHandle!;

    for (let i = 0; i < parts.length - 1; i++) {
      // No need to check EXCLUDE_DIRS here since we're using isIgnored
      try {
        currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
      } catch {
        return null;
      }
    }

    try {
      return await currentHandle.getFileHandle(parts[parts.length - 1]);
    } catch {
      return null;
    }
  }
}
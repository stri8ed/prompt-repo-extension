import {BlobReader, Entry, getMimeType, TextWriter, ZipReader} from "@zip.js/zip.js";
import axios from "axios";
import {isTextFile} from "@/utils/fileUtils.ts";

export default class RepoFileProvider {
  private readonly url: string;
  private reader: ZipReader<any> | null = null;

  public constructor(url: string) {
    this.url = url;
  }

  public async loadContents() {
    const blob = await downloadWithProgress(this.url, progress => console.log(progress));
    const zipFileReader = new BlobReader(blob);
    this.reader = new ZipReader(zipFileReader);
    return this;
  }

  public async getTextFileInfo() {
    const entries = await this.reader!.getEntries();
    const texts = entries.filter(e => isTextFile(e.filename))
    return texts.map(e => {
      return {
        name: e.filename,
        byteLength: e.uncompressedSize
      }
    });
  }

  public async getEntries() {
    return await this.reader!.getEntries()
  }

  public async getFileContents(entries: Entry[]): Promise<{ [fileName: string]: string }> {
    const validEntries = entries.filter(entry => typeof entry.getData === 'function');
    const contentPromises = validEntries.map(async (entry) => {
      try {
        const writer = new TextWriter();
        const content = await entry.getData!(writer);
        return [entry.filename, content] as [string, string];
      } catch (error) {
        console.error(`Error reading file ${entry.filename}:`, error);
        return [entry.filename, '']
      }
    });

    const contents = await Promise.all(contentPromises);
    return Object.fromEntries(contents);
  }

}

async function downloadWithProgress(url: string, onProgress: (progress: number) => void) {
  const response = await axios.get(url, {
    responseType: 'blob',
     onDownloadProgress: (progressEvent) => {
      const { loaded } = progressEvent;
      onProgress(loaded);
    }
  });
  return response.data;
}
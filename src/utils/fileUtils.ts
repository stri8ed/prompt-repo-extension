import {getMimeType} from "@zip.js/zip.js";

const TEXT_FILE_EXTENSIONS = [
  '.txt', '.md', '.js', '.ts', '.jsx', '.tsx', '.php', '.py', '.rb', '.java',
  '.c', '.cpp', '.h', '.hpp', '.cs', '.go', '.rs', '.swift', '.kt', '.scala',
  '.html', '.css', '.scss', '.sass', '.less', '.json', '.xml', '.yaml', '.yml',
  '.ini', '.conf', '.sh', '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
  '.sql', '.graphql', '.prisma', '.env'
];

export function isTextFile(fileName: string): boolean {
  const extension = fileName.slice(fileName.lastIndexOf('.'));
  return getMimeType(fileName).includes('text') ||
    TEXT_FILE_EXTENSIONS.includes(extension.toLowerCase());
}
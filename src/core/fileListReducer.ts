type FileContents = {
  [key: string]: string;
}

function generateFolderStructure(files: FileContents): string {
  const structure: { [key: string]: any } = {};

  Object.keys(files).forEach(path => {
    const parts = path.split('/').filter(Boolean);
    let current = structure;
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = null; // File
      } else {
        if (!current[part]) current[part] = {};
        current = current[part];
      }
    });
  });

  function stringifyStructure(obj: any, indent: string = ''): string {
    let result = '';
    Object.keys(obj).forEach(key => {
      result += `${indent}${key}${obj[key] ? '/' : ''}\n`;
      if (obj[key] !== null) {
        result += stringifyStructure(obj[key], indent + '  ');
      }
    });
    return result;
  }

  return "```\n" + stringifyStructure(structure) + "```";
}

function escapeBackticks(content: string): string {
  return content.replace(/`/g, '\\`');
}

export default function fileListReducer(files: FileContents) {
  const projectName = Object.keys(files)[0].split('/')[0];
  let content = `# Codebase: ${projectName}\n\n`;

  content += "## Directory Structure\n";
  content += generateFolderStructure(files) + "\n\n";

  content += "## File Contents\n\n";

  for (const [filePath, fileContent] of Object.entries(files)) {
    if(fileContent.trim().length === 0) {
      continue;
    }
    const pathParts = filePath.split('/');
    const fileName = pathParts.slice(1).join('/');
    content += `### ${fileName}\n`;
    content += "```\n";
    content += escapeBackticks(fileContent);
    content += "\n```\n\n";
  }

  return { content: content.trim(), root: projectName };
}
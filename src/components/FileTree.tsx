import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import React, { useEffect, useMemo, useState } from 'react';
import CheckboxTree from 'react-checkbox-tree';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronDown
} from "@fortawesome/free-solid-svg-icons";
import {
  faCheckSquare,
  faSquare,
  faPlusSquare,
  faMinusSquare,
  faFolder,
  faFolderOpen,
  faFile
} from "@fortawesome/free-regular-svg-icons";
import { FileInfo } from "@/types.ts";
import {useDebounce} from "use-debounce";

type FileTreeProps = {
  files: FileInfo[]
  checked: string[]
  search: string
  onCheckedChange: (checked: string[]) => void
}

type TreeNode = {
  value: string
  label: React.ReactNode
  children?: TreeNode[]
}

type FileTreeResult = [TreeNode | null, string[]];

const buildFileTree = (files: FileInfo[], search: string): FileTreeResult => {
  if (!files.length) return [null, []];

  const searchLower = search.toLowerCase();
  const filteredFiles = search ?
    files.filter(f => f.name.toLowerCase().includes(searchLower)) :
    files;

  if (!filteredFiles.length) return [null, []];

  const tree: { [key: string]: TreeNode } = {};
  const matchedFiles = filteredFiles.map(f => f.name);

  filteredFiles.forEach(file => {
    const parts = file.name.split('/');
    let path = '';

    parts.forEach((part, idx) => {
      const currentPath = path ? `${path}/${part}` : part;
      const isLast = idx === parts.length - 1;

      if (!tree[currentPath]) {
        const label = search ? highlightSearchText(part, search) : part;
        tree[currentPath] = {
          value: currentPath,
          label,
          ...(isLast ? {} : { children: [] })
        };

        if (path && tree[path]) {
          tree[path].children?.push(tree[currentPath]);
        }
      }
      path = currentPath;
    });
  });

  const sortNodes = (nodes: TreeNode[] = []): TreeNode[] =>
    nodes.sort((a, b) => {
      const aIsFolder = Boolean(a.children);
      const bIsFolder = Boolean(b.children);
      return aIsFolder === bIsFolder
        ? a.value.localeCompare(b.value)
        : aIsFolder ? -1 : 1;
    });

  const root = sortNodes(Object.values(tree).filter(node => !node.value.includes('/')))[0] || null;
  return [root, matchedFiles];
};

const highlightSearchText = (text: string, search: string): React.ReactNode => {
  if (!search) return text;
  const index = text.toLowerCase().indexOf(search.toLowerCase());
  return index === -1 ? text : (
    <>
      {text.slice(0, index)}
      <span className="font-semibold">{text.slice(index, index + search.length)}</span>
      {text.slice(index + search.length)}
    </>
  );
};

const icons = {
  check: <FontAwesomeIcon icon={faCheckSquare} />,
  uncheck: <FontAwesomeIcon icon={faSquare} />,
  halfCheck: <FontAwesomeIcon icon={faCheckSquare} />,
  expandClose: <FontAwesomeIcon icon={faChevronRight} />,
  expandOpen: <FontAwesomeIcon icon={faChevronDown} />,
  expandAll: <FontAwesomeIcon icon={faPlusSquare} />,
  collapseAll: <FontAwesomeIcon icon={faMinusSquare} />,
  parentClose: <FontAwesomeIcon icon={faFolder} />,
  parentOpen: <FontAwesomeIcon icon={faFolderOpen} />,
  leaf: <FontAwesomeIcon icon={faFile} />
};

export default function FileTree({ files, checked, onCheckedChange, search }: FileTreeProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [searchValue] = useDebounce(search, 350, { leading: false });
  const [root, matchedFiles] = useMemo(() => buildFileTree(files, searchValue), [files, searchValue]);

  useEffect(() => {
    if (!root) return;

    if (!searchValue) {
      setExpanded([root.value]);
      return;
    }

    const paths = new Set<string>();
    const collectPaths = (node: TreeNode) => {
      paths.add(node.value);
      node.children?.forEach(collectPaths);
    };
    collectPaths(root);
    setExpanded(Array.from(paths));
  }, [searchValue, root]);

  if (!root) {
    return (
      <div className="flex flex-col justify-center items-center min-h-44 mb-8">
        <FontAwesomeIcon icon={faFolderOpen} className="text-gray-400 w-8 h-8"/>
        <span className="text-gray-400 text-xl mt-1">No files found</span>
      </div>
    );
  }

  const handleCheck = (newChecked: string[]) => {
    onCheckedChange([
      ...newChecked,
      ...checked.filter(c => !newChecked.includes(c) && !matchedFiles.includes(c))
    ]);
  }

  return (
    <CheckboxTree
      icons={icons}
      nodes={[root]}
      checked={checked}
      expanded={expanded}
      onCheck={handleCheck}
      onExpand={setExpanded}
      showExpandAll={false}
    />
  );
}
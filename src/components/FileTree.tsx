import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import React, { useEffect, useMemo, useState } from 'react';
import CheckboxTree, { Node as TreeNode } from 'react-checkbox-tree';
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
import Spinner from "@/components/Spinner.tsx";

type FileTreeProps = {
  files: FileInfo[]
  checked: string[]
  search: string
  onCheckedChange: (checked: string[]) => void
}

type TreeNodeWithMeta = TreeNode & {
  _sortKey?: string
}

const getParentPaths = (path: string): string[] => {
  const parts = path.split('/');
  return parts.reduce((paths: string[], _, index) => {
    paths.push(parts.slice(0, index + 1).join('/'));
    return paths;
  }, []);
};

const createTreeNode = (
  label: string | React.ReactNode,
  isLeaf: boolean,
  fullPath: string
): TreeNodeWithMeta => ({
  value: fullPath,
  label,
  _sortKey: typeof label === 'string' ? label : '',
  ...(isLeaf ? {} : { children: [] })
});

const highlightSearchMatch = (label: string, search: string): React.ReactNode | string => {
  if (!search) return label;

  const searchLower = search.toLowerCase();
  const labelLower = label.toLowerCase();
  const index = labelLower.indexOf(searchLower);

  if (index === -1) return label;

  return (
    <>
      {label.slice(0, index)}
      <span className="font-semibold">
          {label.slice(index, index + search.length)}
      </span>
      {label.slice(index + search.length)}
    </>
  );
}

const sortTreeNodes = (nodes: TreeNodeWithMeta[]): TreeNodeWithMeta[] => {
  return nodes.sort((a, b) => {
    const aIsFolder = Boolean(a.children);
    const bIsFolder = Boolean(b.children);
    if (aIsFolder === bIsFolder) {
      return (a._sortKey || '').localeCompare(b._sortKey || '');
    }
    return aIsFolder ? -1 : 1;
  });
};

const buildFileTree = (files: FileInfo[], search: string): TreeNodeWithMeta|null => {
  if (!files.length) {
    return null;
  }

  const matchedPaths = new Set<string>();
  const searchLower = search.toLowerCase();

  if (search) {
    files.forEach(file => {
      if (file.name.toLowerCase().includes(searchLower)) {
        matchedPaths.add(file.name);
        getParentPaths(file.name).forEach(path => matchedPaths.add(path));
      }
    });

    if (matchedPaths.size === 0) {
      return null;
    }
  }

  const filesToProcess = search ?
    files.filter(f => matchedPaths.has(f.name)) :
    files;

  const root: TreeNodeWithMeta = createTreeNode('', false, '');

  filesToProcess.forEach(file => {
    const parts = file.name.split('/');
    let current = root;
    let ancestorPath = '';

    parts.forEach((part, idx) => {
      const isLeaf = idx === parts.length - 1;
      const label = highlightSearchMatch(part, search);

      const fullPath = ancestorPath ? `${ancestorPath}/${part}` : part;

      let child = current.children?.find(c => c.value === fullPath);

      if (!child) {
        child = createTreeNode(label, isLeaf, fullPath);
        current.children?.push(child);
      }

      current = child;
      ancestorPath = fullPath;
    });
  });

  const sortTreeRecursive = (node: TreeNodeWithMeta): TreeNodeWithMeta => {
    if (node.children) {
      node.children = sortTreeNodes(node.children as TreeNodeWithMeta[]);
      node.children.forEach(child => sortTreeRecursive(child as TreeNodeWithMeta));
    }
    return node;
  };

  return root.children?.[0] ?
    sortTreeRecursive(root.children[0]) :
    null;
};

const icons = {
  check: <FontAwesomeIcon className="rct-icon rct-icon-check" icon={faCheckSquare} />,
  uncheck: <FontAwesomeIcon className="rct-icon rct-icon-uncheck" icon={faSquare} />,
  halfCheck: <FontAwesomeIcon className="rct-icon rct-icon-half-check" icon={faCheckSquare} />,
  expandClose: <FontAwesomeIcon className="rct-icon rct-icon-expand-close" icon={faChevronRight} />,
  expandOpen: <FontAwesomeIcon className="rct-icon rct-icon-expand-open" icon={faChevronDown} />,
  expandAll: <FontAwesomeIcon className="rct-icon rct-icon-expand-all" icon={faPlusSquare} />,
  collapseAll: <FontAwesomeIcon className="rct-icon rct-icon-collapse-all" icon={faMinusSquare} />,
  parentClose: <FontAwesomeIcon className="rct-icon rct-icon-parent-close" icon={faFolder} />,
  parentOpen: <FontAwesomeIcon className="rct-icon rct-icon-parent-open" icon={faFolderOpen} />,
  leaf: <FontAwesomeIcon className="rct-icon rct-icon-leaf-close" icon={faFile} />
};

export default function FileTree({ files, checked, onCheckedChange, search }: FileTreeProps) {
  const [expanded, setExpanded] = useState<string[]>([]);

  const root = useMemo(() => buildFileTree(files, search), [files, search]);

  useEffect(() => {
    if (!search && root) {
      setExpanded([root.value]);
      return;
    }

    const expandedPaths = new Set<string>();

    const collectPaths = (node: TreeNodeWithMeta) => {
      if (node.value) expandedPaths.add(node.value);
      node.children?.forEach(child => collectPaths(child as TreeNodeWithMeta));
    };

    files.forEach(file => {
      if (file.name.toLowerCase().includes(search.toLowerCase()) && root) {
        getParentPaths(file.name).forEach(path => expandedPaths.add(path));
        collectPaths(root);
      }
    });

    setExpanded(Array.from(expandedPaths));
  }, [search, files, root]);

  if(!root) {
    return <NoFilesFound/>
  }

  return (
    <CheckboxTree
      icons={icons}
      nodes={[root]}
      checked={checked}
      expanded={expanded}
      onCheck={onCheckedChange}
      onExpand={setExpanded}
      showExpandAll={false}
    />
  );
}

function NoFilesFound() {
  return (
    <div className="flex flex-col justify-center items-center min-h-44 mb-8">
      <FontAwesomeIcon icon={faFolderOpen} className="text-gray-400 w-8 h-8"/>
      <span className="text-gray-400 text-xl mt-1">No files found</span>
    </div>
  )
}
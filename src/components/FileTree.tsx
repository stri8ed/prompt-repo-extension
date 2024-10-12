import 'react-checkbox-tree/lib/react-checkbox-tree.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { faCheckSquare, faSquare, faPlusSquare, faMinusSquare, faFolder, faFolderOpen, faFile } from "@fortawesome/free-regular-svg-icons";
import React, {useEffect, useMemo, useState} from 'react';
import CheckboxTree, { Node as TreeNode } from 'react-checkbox-tree';
import {FileInfo} from "@/types.ts";

export type FileTreeProps = {
  files: FileInfo[],
  onCheckedChange: (checked: string[]) => void,
  checked: string[]
}

function entriesToTree(files: FileInfo[]): TreeNode {
  const tree: TreeNode = { value: '', label: '', children: [] };
  for (const file of files) {
    const fileName = file.name;
    const parts = fileName.split('/');
    let current = tree;
    parts.forEach((part, idx) => {
      let child = current.children!.find(c => c.label === part);
      const prevParts = parts.slice(0, idx + 1)
      const isLeaf = idx === parts.length - 1;
      if (!child) {
        child = {
          label: part,
          value: prevParts.join('/'),
          children: isLeaf ? undefined : []
        };
        current.children!.push(child);
      }
      current = child;
    })
  }
  return tree.children![0];
}

export default function({ files, checked, onCheckedChange }: FileTreeProps) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const nodes = useMemo(() => entriesToTree(files), [files])

  useEffect(() => {
    setExpanded([nodes.value])
  }, [nodes]);

  const onChecked = (items: string[]) => {
    onCheckedChange(items)
  }

  return (
    <CheckboxTree
      icons={{
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
      }}
      nodes={[nodes]}
      checked={checked}
      expanded={expanded}
      onCheck={onChecked}
      onExpand={(expanded) => setExpanded(expanded)}
    />
  );
}
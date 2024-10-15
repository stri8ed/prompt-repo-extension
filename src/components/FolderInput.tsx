import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderPlus } from "@fortawesome/free-solid-svg-icons";
import React, { useState, useCallback, useEffect, useRef } from "react";

export type FolderInputProps = {
  onSelect: (directory: FileSystemDirectoryHandle) => void;
  onErrorMessage?: (message: string) => void;
};

export default function FolderInput({ onSelect, onErrorMessage }: FolderInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.items.length > 0) {
        const item = e.dataTransfer.items[0];
        if (item.kind === "file") {
          try {
            const handle = await item.getAsFileSystemHandle();
            if (handle && handle.kind === "directory") {
              onSelect(handle as FileSystemDirectoryHandle);
            }
          } catch (error: any) {
            onErrorMessage?.(error.message);
          }
        }
      }
    },
    [onSelect, onErrorMessage]
  );

  const selectDirectory = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      onSelect(dirHandle);
    } catch (e: any) {
      if (e.name !== "AbortError") {
        onErrorMessage?.(e.message);
      }
    }
  };

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDocumentDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const handleDocumentDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Check if the drop occurred inside our drop zone
      if (dropZone.contains(e.target as Node)) {
        handleDrop(e as unknown as React.DragEvent);
      }
    };

    document.addEventListener('dragover', handleDocumentDragOver, false);
    document.addEventListener('drop', handleDocumentDrop, false);

    return () => {
      document.removeEventListener('dragover', handleDocumentDragOver, false);
      document.removeEventListener('drop', handleDocumentDrop, false);
    };
  }, [handleDrop]);

  return (
    <div
      ref={dropZoneRef}
      className="flex items-center justify-center w-full mb-4"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <label
        onClick={selectDirectory}
        className={`
          transition-all
          flex flex-col items-center justify-center w-full h-28 
          border-2 border-dashed rounded-lg cursor-pointer
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <FontAwesomeIcon
            className={`w-8 h-8 mb-1 ${isDragging ? "text-blue-500" : "text-gray-400"}`}
            icon={faFolderPlus}
          />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Select or drop a local directory
          </p>
        </div>
      </label>
    </div>
  );
}
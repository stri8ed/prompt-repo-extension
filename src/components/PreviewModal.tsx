import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCopy} from "@fortawesome/free-regular-svg-icons";
import CloseButton from "@/components/CloseButton.tsx";
import Modal from "@/components/Modal.tsx";
import React from "react";
import toast from "react-hot-toast";

type PreviewModalProps = {
  content: string;
  show: boolean;
  onClose: () => void;
}

async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
  toast.success('Copied to clipboard');
}

export default function ({ content, show, onClose}: PreviewModalProps) {
  return (
    <Modal maxWidth='3xl' show={show} onClose={onClose}>
      <div className="flex items-center p-3 px-4 border-b border-gray-200">
        <div className="flex-grow flex">
          <h3 className="text-base ">Preview</h3>
        </div>
        <button type="button"
              title="Copy"
              onClick={() => copyToClipboard(content)}
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
        >
          <FontAwesomeIcon className="" icon={faCopy} />
          <span className="sr-only">Copy</span>
        </button>
        <CloseButton onClick={onClose}/>
      </div>
      <pre className="text-xs p-2  overflow-scroll max-h-[70vh]">
            {content}
      </pre>
    </Modal>
  )
}
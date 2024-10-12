import Modal from "@/components/Modal.tsx";
import React, {useEffect, useMemo, useRef, useState} from "react";
import FileTree from "@/components/FileTree.tsx";
import Button from "@/components/Button.tsx";
import {FileInfo, RequestType} from "@/types.ts";
import {keepAlive, sendMessage} from "@/utils/messaging.ts";
import {bytesToSize} from "@/utils/textUtils.ts";
import Spinner from "@/components/Spinner.tsx";
import CloseButton from "@/components/CloseButton.tsx";
import PreviewModal from "@/components/PreviewModal.tsx";
import toast, {Toaster} from "react-hot-toast";
import {SiteConfig} from "@/config/siteConfig.ts";
import {simulateFileDrop} from "@/utils/domUtils.tsx";
import {marked} from "marked";
import BackButton from "@/components/BackButton.tsx";

type AppProps = {
  show: boolean,
  onClose: () => void,
  config: SiteConfig
}

export default function App({ show, onClose, config } : AppProps) {
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [prompt, setPrompt] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const inputRef = useRef<HTMLInputElement>(null);
  const totalSelectedBytes = useMemo(() => {
    return selectedFiles.reduce((prev, curr) => {
      return prev + files.find(f => f.name === curr)?.byteLength!
    }, 0)
  }, [selectedFiles, files])

  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show]);

  useEffect(() => {
    if(errorMessage) {
      toast.error(errorMessage)
    }
  }, [errorMessage]);

  useEffect(() => {
    // After 30 seconds of inactivity, chrome may kill the service worker
    if(files.length) {
      const interval = keepAlive(5000)
      return () => clearInterval(interval)
    }
  }, [files]);

  async function downloadRepo() {
    if(!url) {
      return;
    }

    try {
      setSelectedFiles([])
      setIsLoading(true)
      setErrorMessage('');
      const res = await sendMessage(RequestType.LoadRepo, { url });
      setFiles(res.files)
    } catch (e: any) {
      setErrorMessage(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const submitFileNames = async () => {
    try {
      setErrorMessage('');
      const { compiledText } = await sendMessage(RequestType.CompilePrompt, { fileNames: selectedFiles, url })
      const target = document.querySelector(config.inputSelector)!;
      if(config.canDragAndDrop()) {
        simulateFileDrop(target, 'repo.txt', compiledText);
      } else {
        target.innerHTML = marked.parse(compiledText) as string
      }
      onClose()
    } catch (e: any) {
      setErrorMessage(e.message)
    }
  }

  const preview = async () => {
    const { compiledText } = await sendMessage(RequestType.CompilePrompt, { fileNames: selectedFiles, url })
    setPrompt(compiledText)
    setShowPreview(true)
  }

  const close = () => {
    onClose()
  }

  return (
    <div>
      <Modal show={show} onClose={() => {
      }}>
        <div className="flex items-center p-5">
          {files.length > 0 && <BackButton onClick={() => setFiles([])} />}
          <div className="flex-grow flex">
            <h3 className="text-lg font-medium ml-2">{files.length ? 'Select files': 'Select Repository'}</h3>
          </div>
          <CloseButton onClick={close} />
        </div>
        {
          isLoading && (
            <div className="flex justify-center items-center min-h-44 mb-8">
              <Spinner/>
            </div>
          )
        }
        {
          (!files.length && !isLoading) && (<div className=" px-7 mb-5">
            <label htmlFor="repo_url" className="block mb-2 text-sm font-medium text-gray-900">Repo URL</label>
            <input type="text"
                   id="repo_url"
                   ref={inputRef}
                   onChange={(e) => setUrl(e.target.value)}
                   value={url}
                   tabIndex={0}
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mb-3"
                   placeholder="http://github.com"
                   required
            />
            <Button onClick={downloadRepo}>Submit</Button>
          </div>)
        }
        <div className="">
          {files.length > 0 && <div>
              <div className="px-4 overflow-auto max-h-[50vh] mb-4">
                  <FileTree onCheckedChange={setSelectedFiles} checked={selectedFiles} files={files}/>
              </div>
              <div className="border-t border-gray-200 p-3 px-4 flex justify-between items-center">
                  <p className="text-xs ml-3 text-gray-800">{selectedFiles.length} files {totalSelectedBytes > 0 ? `(${bytesToSize(totalSelectedBytes)})` : ''} selected, {files.length} files total</p>
                <div>
                  {selectedFiles.length > 0 && <Button className="mr-2" type="secondary" disabled={selectedFiles.length === 0} onClick={preview}>Preview</Button>}
                    <Button disabled={selectedFiles.length === 0} onClick={submitFileNames}>Attach</Button>
                </div>
              </div>
          </div>}
        </div>

        <PreviewModal content={prompt} show={showPreview} onClose={() => setShowPreview(false)} />
      </Modal>
      <Toaster />
    </div>
  )
}
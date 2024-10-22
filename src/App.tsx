import Modal from "@/components/Modal.tsx";
import React, {useEffect, useMemo, useRef, useState} from "react";
import FileTree from "@/components/FileTree.tsx";
import Button from "@/components/Button.tsx";
import {FileInfo, RequestType} from "@/types.ts";
import {bytesToSize} from "@/utils/textUtils.ts";
import Spinner from "@/components/Spinner.tsx";
import CloseButton from "@/components/CloseButton.tsx";
import PreviewModal from "@/components/PreviewModal.tsx";
import toast, {Toaster} from "react-hot-toast";
import {SiteConfig} from "@/config/siteConfig.ts";
import {simulateFileSelection} from "@/utils/domUtils.tsx";
import {marked} from "marked";
import BackButton from "@/components/BackButton.tsx";
import {createFileProvider, FileProvider, FileProviderType} from "@/core/fileProviderFactory.ts";
import {faFolderPlus} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import FolderInput from "@/components/FolderInput.tsx";
import {sendMessage} from "@/utils/messaging.ts";
import SearchInput from "@/components/SearchInput.tsx";

type AppProps = {
  show: boolean,
  onClose: () => void,
  config: SiteConfig
}

const KEEL_ALIVE_INTERVAL = 3500; // prevent service worker from being killed

export default function App({ show, onClose, config } : AppProps) {
  const [fileProvider, setFileProvider] = useState<FileProvider | null>(null)
  const [url, setUrl] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([])
  const [search, setSearch] = useState('')
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
    if(files.length && fileProvider?.type === 'repo') {
      const interval = setInterval(() =>
        sendMessage(RequestType.KeepAlive, { url }),
        KEEL_ALIVE_INTERVAL
      );
      return () => clearInterval(interval)
    }
  }, [files]);

  async function loadSource(type: FileProviderType, source: string | FileSystemDirectoryHandle) {
    try {
      setSelectedFiles([])
      setIsLoading(true)
      setErrorMessage('');
      setSearch('');
      const provider = await createFileProvider(type, source)
      setFileProvider(provider)
      setFiles(provider.files)
    } catch (e: any) {
      setErrorMessage(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  const submitFileNames = async () => {
    try {
      setErrorMessage('');
      const { content, root } = await fileProvider!.compilePrompt(selectedFiles)
      const textInput = document.querySelector(config.inputSelector)!
      const fileInput = document.querySelector(config.fileInputSelector) as HTMLInputElement | null;
      if(fileInput) {
        simulateFileSelection(fileInput, `${root}.txt`, content);
      } else {
        textInput.innerHTML = marked.parse(content) as string
      }
      onClose()
    } catch (e: any) {
      setErrorMessage(e.message)
    }
  }

  async function downloadRepo() {
    if (!url) return;
    await loadSource('repo', url);
  }

  async function onSelectDir(dirHandle: FileSystemDirectoryHandle) {
    await loadSource('filesystem', dirHandle);
  }

  const preview = async () => {
    const { content } = await fileProvider!.compilePrompt(selectedFiles)
    setPrompt(content)
    setShowPreview(true)
  }

  const close = () => {
    onClose()
  }

  return (
    <div>
      <Modal show={show} onClose={onClose}>
        <div className="flex items-center p-5">
          {files.length > 0 && <BackButton onClick={() => setFiles([])} />}
          <div className="flex-grow flex">
            <h3 className="text-lg font-medium ml-2">{files.length ? 'Select files': 'Import Repository'}</h3>
          </div>
          { files.length > 0 && <SearchInput value={search} onChange={setSearch} className='mr-2' />}
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

            <FolderInput onSelect={onSelectDir} onErrorMessage={setErrorMessage}/>

            <label htmlFor="repo_url" className="block mb-2 mt-8 text-sm text-gray-900">Or import from Github</label>
            <div className="relative mb-8">
              <input type="text" id="repo_url"
                     ref={inputRef}
                     value={url}
                      onChange={(e) => setUrl(e.target.value)}
                     className="block w-full p-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                     placeholder="http://github.com/" required/>
              <button type="button"
                      onClick={downloadRepo}
                      className="text-white absolute end-2 bottom-[7px] bg-blue-700 hover:bg-blue-800 focus:outline-none rounded-lg text-sm px-3 py-1.5 ">Import
              </button>
            </div>

          </div>)
        }
        <div className="">
          {files.length > 0 && <div>
              <div className="px-4 overflow-auto max-h-[50vh] mb-4">
                  <FileTree
                      search={search}
                      onCheckedChange={setSelectedFiles}
                      checked={selectedFiles}
                      files={files}
                  />
              </div>
              <div className="border-t border-gray-200 p-3 px-4 flex justify-between items-center">
                  <p className="text-xs ml-3 text-gray-800">{selectedFiles.length} files {totalSelectedBytes > 0 ? `(${bytesToSize(totalSelectedBytes)})` : ''} selected, {files.length} files
                      total</p>
                  <div>
                    {selectedFiles.length > 0 &&
                        <Button className="mr-2" type="secondary" disabled={selectedFiles.length === 0}
                                onClick={preview}>Preview</Button>}
                      <Button disabled={selectedFiles.length === 0} onClick={submitFileNames}>Attach</Button>
                  </div>
              </div>
          </div>}
        </div>

        <PreviewModal content={prompt} show={showPreview} onClose={() => setShowPreview(false)}/>
      </Modal>
      <Toaster/>
    </div>
  )
}
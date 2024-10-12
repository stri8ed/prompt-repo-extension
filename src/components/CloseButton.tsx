
type CloseButtonProps = {
  onClick: () => void;
}

export default function ({ onClick }: CloseButtonProps) {
  return (
    <button type="button"
            onClick={onClick}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
            data-modal-hide="default-modal">
      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
           viewBox="0 0 14 14">
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"></path>
      </svg>
      <span className="sr-only">Close</span>
    </button>
  )
}


export default function ({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" title="Back"
            onClick={onClick}
            className="bg-transparent hover:bg-gray-200 text-gray-400 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
            >
      <svg aria-labelledby="svg-inline--fa-title-vvoASVEMRUhw" data-prefix="fas" data-icon="arrow-left"
           className="svg-inline--fa fa-arrow-left w-4 h-4" role="img" xmlns="http://www.w3.org/2000/svg"
           viewBox="0 0 448 512"><title id="svg-inline--fa-title-vvoASVEMRUhw">Back</title>
        <path fill="currentColor"
              d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.2 288 416 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-306.7 0L214.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"></path>
      </svg>
    </button>
  )
}
export interface ModalProps {
  id?: string;
  title: string | React.ReactNode;
  onClose: () => void;
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function Modal({ id, title, onClose, actions, children }: ModalProps) {
  return (
    <>
      <div
        id={id}
        tabIndex={-1}
        className="overflow-y-auto flex content-center overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full"
      >
        <div className="relative p-4 w-full max-w-2xl max-h-full">
          <div className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 sticky top-0 bg-white">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={onClose}
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="p-4 md:p-5 space-y-4">{children}</div>

            {actions ? (
              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                {actions}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40"></div>
    </>
  );
}

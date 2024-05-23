import { CloseButton, Description, Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

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
      <Dialog open={true} onClose={onClose} id={id} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <div className="relative p-4 w-full max-w-4xl max-h-full">
            <DialogPanel className="relative bg-white rounded-lg shadow dark:bg-gray-700 max-h-[80vh] flex flex-col">
              <div className="flex  items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 sticky top-0 bg-white">
                <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">{title}</DialogTitle>
                <CloseButton className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white">
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
                </CloseButton>
              </div>

              <Description className="flex-1 min-h-0 p-4 md:p-5 space-y-4 overflow-y-auto">{children}</Description>

              {actions ? (
                <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 justify-end">
                  {actions}
                </div>
              ) : null}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
      <div className="bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40"></div>
    </>
  );
}

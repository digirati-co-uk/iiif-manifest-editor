import {
  CloseButton,
  Description,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

export interface ModalProps {
  id?: string;
  title: string | React.ReactNode;
  onClose: () => void;
  className?: string;
  open?: boolean;
  width?: number | string;
  height?: number | string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export function ModalBackSlot({ children }: { children: React.ReactNode }) {
  const element = document.getElementById("modal-back-slot");

  if (!element) return null;

  return createPortal(children, element);
}

export function Modal({
  id,
  className,
  title,
  open = true,
  onClose,
  actions,
  children,
}: ModalProps) {
  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        id={id}
        className="relative z-[1000002]"
      >
        <div
          className={`fixed inset-0 bg-black/30 animate-fadeIn z-[1000003]`}
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4 z-[1000004]">
          <div
            className={twMerge(
              "relative p-4 w-full max-w-4xl max-h-full",
              className,
            )}
          >
            <DialogPanel className="relative bg-white rounded-lg overflow-hidden shadow-2xl max-h-[80vh] flex flex-col">
              <div className="flex  items-center justify-between gap-3 p-4 rounded-t-lg sticky top-0 bg-white">
                <div id="modal-back-slot" />
                <DialogTitle className="text-xl font-semibold text-gray-900 grow">
                  {title}
                </DialogTitle>
                <CloseButton className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center">
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close</span>
                </CloseButton>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
                {children}
              </div>

              {actions ? (
                <div className="flex items-center p-4 border-t border-gray-200 rounded-b justify-end">
                  {actions}
                </div>
              ) : null}
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  );
}

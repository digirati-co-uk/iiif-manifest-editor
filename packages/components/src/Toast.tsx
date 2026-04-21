import { useToast, useToastRegion } from "@react-aria/toast";
import type { QueuedToast, ToastState } from "@react-stately/toast";
import type { ReactNode, SVGProps } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { CloseIcon } from "./icons/CloseIcon";
import { CheckIcon } from "./icons/CheckIcon";
import { InfoIcon } from "./icons/InfoIcon";

export type ToastVariant = "info" | "success" | "warning" | "error";

export type ToastContent = {
  title: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  action?: {
    label: ReactNode;
    onPress: () => void;
    closeOnPress?: boolean;
  };
};

export interface ToastRegionProps {
  state: ToastState<ToastContent>;
  className?: string;
  "aria-label"?: string;
}

function WarningIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
      <path d="M1 21h22L12 2L1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}

function ErrorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

type VariantConfig = {
  borderClass: string;
  iconClass: string;
  actionClass: string;
  progressClass: string;
  Icon: (props: SVGProps<SVGSVGElement>) => ReactNode;
};

const variantConfig: Record<ToastVariant, VariantConfig> = {
  info: {
    borderClass: "border-l-me-primary-500",
    iconClass: "text-me-primary-500",
    actionClass: "text-me-primary-600 hover:bg-gray-100",
    progressClass: "bg-me-primary-500",
    Icon: InfoIcon,
  },
  success: {
    borderClass: "border-l-green-600",
    iconClass: "text-green-600",
    actionClass: "text-green-700 hover:bg-green-50",
    progressClass: "bg-green-600",
    Icon: CheckIcon,
  },
  warning: {
    borderClass: "border-l-orange-500",
    iconClass: "text-orange-500",
    actionClass: "text-orange-700 hover:bg-orange-50",
    progressClass: "bg-orange-500",
    Icon: WarningIcon,
  },
  error: {
    borderClass: "border-l-red-500",
    iconClass: "text-red-500",
    actionClass: "text-red-700 hover:bg-red-50",
    progressClass: "bg-red-500",
    Icon: ErrorIcon,
  },
};

export function ToastRegion({ state, className, "aria-label": ariaLabel = "Notifications" }: ToastRegionProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { regionProps } = useToastRegion({ "aria-label": ariaLabel }, state, ref);
  // Portal requires a mounted DOM target — avoid SSR mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted || !state.visibleToasts.length) {
    return null;
  }

  // Render via portal so `position: fixed` is relative to the viewport,
  // not trapped inside any overflow:hidden or transformed ancestor.
  // Wrap in `.manifest-editor` so scoped Tailwind utilities still apply.
  return createPortal(
    <div className="manifest-editor">
      <div
        {...regionProps}
        ref={ref}
        className={twMerge(
          "fixed bottom-5 right-5 z-[10000000] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col gap-2 pointer-events-none sm:w-96",
          className,
        )}
      >
        {state.visibleToasts.map((toast) => (
          <ToastItem key={toast.key} toast={toast} state={state} />
        ))}
      </div>
    </div>,
    document.body,
  );
}

function ToastItem({ toast, state }: { toast: QueuedToast<ToastContent>; state: ToastState<ToastContent> }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const { toastProps, contentProps, titleProps, descriptionProps, closeButtonProps } = useToast(
    { toast },
    state,
    ref,
  );
  const content = toast.content;
  const variant = content.variant ?? "info";
  const config = variantConfig[variant];

  return (
    <div
      {...toastProps}
      ref={ref}
      className={twMerge(
        // Base card
        "pointer-events-auto relative overflow-hidden rounded-lg border border-gray-100 border-l-4 bg-white shadow-xl outline-none",
        // Animation states driven by data-animation attribute from react-aria
        "data-[animation=entering]:animate-toast-enter",
        "data-[animation=exiting]:animate-toast-exit",
        // Focus ring
        "focus-visible:ring-2 focus-visible:ring-me-primary-500 focus-visible:ring-offset-2",
        config.borderClass,
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3">
        {/* Variant icon */}
        <config.Icon
          aria-hidden
          className={twMerge("mt-0.5 h-4 w-4 shrink-0 text-base", config.iconClass)}
        />
        {/* Content */}
        <div {...contentProps} className="min-w-0 flex-1">
          <div {...titleProps} className="text-sm font-semibold leading-5 text-gray-900">
            {content.title}
          </div>
          {content.description ? (
            <div {...descriptionProps} className="mt-0.5 text-xs leading-relaxed text-gray-500">
              {content.description}
            </div>
          ) : null}
          {content.action ? (
            <div className="mt-2">
              <Button
                className={twMerge("rounded px-2 py-0.5 text-xs font-medium transition-colors", config.actionClass)}
                onPress={() => {
                  content.action?.onPress();
                  if (content.action?.closeOnPress !== false) {
                    state.close(toast.key);
                  }
                }}
              >
                {content.action.label}
              </Button>
            </div>
          ) : null}
        </div>
        {/* Close button */}
        <Button
          {...closeButtonProps}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        >
          <CloseIcon aria-hidden="true" className="h-3.5 w-3.5" />
        </Button>
      </div>
      {/* Timeout progress bar */}
      {toast.timeout ? (
        <div
          className={twMerge("absolute bottom-0 left-0 h-[2px] w-full origin-left animate-toast-progress opacity-40", config.progressClass)}
          style={{ animationDuration: `${toast.timeout}ms` }}
        />
      ) : null}
    </div>
  );
}

import {
  ToastRegion,
  type ToastContent as ComponentToastContent,
  type ToastVariant as ComponentToastVariant,
} from "@manifest-editor/components";
import { useToastState, type ToastOptions } from "@react-stately/toast";
import { createContext, type ReactNode, useContext, useMemo } from "react";

export type ToastVariant = ComponentToastVariant;

export type ToastContent = ComponentToastContent;

export interface ToastApi {
  add(content: ToastContent, options?: ToastOptions): string;
  info(content: ToastContent, options?: ToastOptions): string;
  success(content: ToastContent, options?: ToastOptions): string;
  warning(content: ToastContent, options?: ToastOptions): string;
  error(content: ToastContent, options?: ToastOptions): string;
  close(key: string): void;
}

interface ToastProviderProps {
  children: ReactNode;
  maxVisibleToasts?: number;
}

const DEFAULT_TOAST_TIMEOUT = 5000;
const ERROR_TOAST_TIMEOUT = 8000;

const ToastReactContext = createContext<ToastApi | null>(null);

function getDefaultTimeout(variant?: ToastVariant) {
  return variant === "error" ? ERROR_TOAST_TIMEOUT : DEFAULT_TOAST_TIMEOUT;
}

export function ToastProvider({ children, maxVisibleToasts = 3 }: ToastProviderProps) {
  const state = useToastState<ToastContent>({ maxVisibleToasts });

  const api = useMemo<ToastApi>(() => {
    const add: ToastApi["add"] = (content, options) =>
      state.add(content, {
        ...options,
        timeout: options?.timeout ?? getDefaultTimeout(content.variant),
      });

    const addVariant = (variant: ToastVariant, content: ToastContent, options?: ToastOptions) =>
      add({ ...content, variant }, options);

    return {
      add,
      info: (content, options) => addVariant("info", content, options),
      success: (content, options) => addVariant("success", content, options),
      warning: (content, options) => addVariant("warning", content, options),
      error: (content, options) => addVariant("error", content, options),
      close: state.close,
    };
  }, [state]);

  return (
    <ToastReactContext.Provider value={api}>
      {children}
      <ToastRegion state={state} />
    </ToastReactContext.Provider>
  );
}

export function useToasts() {
  const api = useContext(ToastReactContext);

  if (!api) {
    throw new Error("useToasts must be used within a ToastProvider");
  }

  return api;
}

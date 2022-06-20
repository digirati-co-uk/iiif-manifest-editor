import { useEffect } from "react";
import { appWindow } from "@tauri-apps/api/window";
import { EventCallback } from "@tauri-apps/api/event";

export function useAppWindowEvent<T = any>(event: string, listener: EventCallback<T>, deps = []) {
  useEffect(() => {
    const unsubscribe = appWindow.listen(event, listener);
    return () => {
      unsubscribe.then((s) => s());
    };
  }, [event, ...deps]);
}

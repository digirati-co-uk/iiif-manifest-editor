"use client";

import { type Config, useLocalStorage } from "@manifest-editor/shell";
import { useCallback, useMemo } from "react";

export const GLOBAL_WEB_CONFIG_STORAGE_KEY = "manifest-editor.web.global-config";

export function useGlobalEditorConfig() {
  const [storedConfig, setStoredConfig] = useLocalStorage<Partial<Config>>(GLOBAL_WEB_CONFIG_STORAGE_KEY, {});

  const globalConfig = useMemo(() => {
    return storedConfig || {};
  }, [storedConfig]);

  const saveGlobalConfig = useCallback(
    (config: Partial<Config>) => {
      setStoredConfig(config);
    },
    [setStoredConfig],
  );

  return {
    globalConfig,
    saveGlobalConfig,
  };
}

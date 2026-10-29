"use client";
import { ShellProvider } from "@manifest-editor/shell";
import { mergeLocalisation } from "@manifest-editor/shell";
import { useMemo, type ComponentProps } from "react";
import { useWebUiResources } from "./WebResources";

/** Shell keeps the inherited host selection/control; these are complete optional resource inputs. */
export function WebShellProvider({ localisation, ...props }: ComponentProps<typeof ShellProvider>) {
  const webUiResources = useWebUiResources();
  const resources = useMemo(() => mergeLocalisation(webUiResources, localisation), [localisation, webUiResources]);
  return <ShellProvider {...props} localisation={resources} />;
}

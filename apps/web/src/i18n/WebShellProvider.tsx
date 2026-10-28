"use client";
import { ShellProvider } from "@manifest-editor/shell";
import { mergeLocalisation } from "@manifest-editor/shell";
import { useMemo, type ComponentProps } from "react";
import { webUiResources } from "./resources";

/** Shell keeps the inherited host selection/control; these are complete optional resource inputs. */
export function WebShellProvider({ localisation, ...props }: ComponentProps<typeof ShellProvider>) {
  const resources = useMemo(() => mergeLocalisation(webUiResources, localisation), [localisation]);
  return <ShellProvider {...props} localisation={resources} />;
}

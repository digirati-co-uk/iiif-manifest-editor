"use client";
import { createContext, useContext } from "react";
import { createWebResourceOptions } from "./resources";

export const WebResourceContext = createContext(createWebResourceOptions());

/** Child shells need the same synchronous data as the outer provider during SSR. */
export function useWebUiResources() {
  return useContext(WebResourceContext).ui;
}

export function useWebExhibitionResources() {
  return useContext(WebResourceContext).exhibition;
}

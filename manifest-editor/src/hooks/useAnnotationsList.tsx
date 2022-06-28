import { AnnotationNormalized } from "@iiif/presentation-3";
import { useEffect, useState } from "react";
import { useCanvas, useVault, useVaultSelector } from "react-iiif-vault";
import { useAppState } from "../shell/AppContext/AppContext";
import { useAnnotation } from "./useAnnotation";
import { useAnnotationPage } from "./useAnnotationPage";

export function useAnnotationList<T = AnnotationNormalized>(): AnnotationNormalized[] | T | undefined | [] | any {
  const { state: appState } = useAppState();

  const canvas = useVaultSelector((state) => state.iiif.entities.Canvas[appState.canvasId]);
  if (!canvas) return [];
  const vault = useVault();

  const annoPages = canvas.annotations.map((annoPage) => {
    return vault.get(annoPage);
  });
  const annoList: any[] = [];
  annoPages.map((annoPage: any) => {
    if (annoPage) {
      return annoPage.items.map((item: any) => {
        annoList.push(vault.get(item.id));
      });
    }
  });

  return annoList;
}

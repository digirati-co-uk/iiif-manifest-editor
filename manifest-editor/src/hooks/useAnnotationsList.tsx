import { AnnotationNormalized } from "@iiif/presentation-3";
import { useCallback, useState, useEffect } from "react";
import { useVault, useVaultSelector } from "react-iiif-vault";
import { v4 } from "uuid";

export function getInitialAnnotationList(canvasId: string) {
  const canvas = useVaultSelector((state) => state.iiif.entities.Canvas[canvasId]);
  if (!canvas) return [];
  const vault = useVault();
  const annoPages = canvas.annotations.map((annoPage) => {
    return vault.get(annoPage);
  });
  const annos: any[] = [];

  annoPages.map((annoPage: any) => {
    if (annoPage) {
      return annoPage.items.map((item: any) => {
        annos.push(vault.get(item.id));
      });
    }
  });
  return annos;
}

export function useAnnotationList<T = AnnotationNormalized>(
  canvasId: string
): AnnotationNormalized[] | T | undefined | [] | any {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string>();
  const [annotations, setAnnotations] = useState<any[]>(getInitialAnnotationList(canvasId));

  const addNewAnnotation = useCallback((bounds: { x: number; y: number; width: number; height: number }) => {
    const id = v4();
    // we need more than these details here
    setAnnotations((a) => [...a, { id, ...bounds }]);
    setIsEditing(false);
    setSelectedAnnotation(undefined);
  }, []);

  useEffect(() => {
    // Dispatch event to the vault when annotations change
  }, [annotations]);

  const editAnnotation = useCallback((id: string) => {
    setIsEditing(true);
    setSelectedAnnotation(id);
  }, []);

  const onDeselect = useCallback(() => {
    setIsEditing(false);
    setSelectedAnnotation(undefined);
  }, []);

  return {
    isEditing,
    annotations,
    addNewAnnotation,
    setIsEditing,
    selectedAnnotation,
    setSelectedAnnotation,
    editAnnotation,
    onDeselect,
  };
}

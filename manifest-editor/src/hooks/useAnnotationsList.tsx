import { AnnotationNormalized } from "@iiif/presentation-3";
import { IIIFBuilder } from "iiif-builder";
import { useCallback, useState, useEffect } from "react";
import { importEntities } from "@iiif/vault/actions";
import { v4 } from "uuid";
import { useAnnotationPage } from "./useAnnotationPage";
import { useCanvas, useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import { emptyAnnotationPage, emptyAnnotation } from "@iiif/parser";
import { addReference } from "@iiif/vault/actions";

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

export function getAnnotationsByAnnotationPage(annotationPageID?: string) {
  const vault = useVault();

  const annotationPage = useAnnotationPage({ id: annotationPageID });
  const annos: any[] = [];
  if (annotationPage) {
    annotationPage.items.map((item: any) => {
      annos.push(vault.get(item.id));
    });
  }
  return annos;
}

export function useAnnotationList<T = AnnotationNormalized>(
  canvasId: string,
  annotationPageId?: string
): AnnotationNormalized[] | T | undefined | [] | any {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string>();
  const [annotations, setAnnotations] = useState<any[]>(getInitialAnnotationList(canvasId));
  const manifest = useManifest();
  const canvas = useCanvas();
  const vault = useVault();
  const [pagedAnnotations, setPagedAnnotations] = useState<any[]>(getAnnotationsByAnnotationPage(annotationPageId));
  const annotationPage = useAnnotationPage();

  const addNewAnnotation = (
    pageId: string,
    bounds: { x: number; y: number; width: number; height: number } = {
      x: 0,
      y: 0,
      width: 100,
      height: 200,
    }
  ) => {
    if (!canvas) return;
    const id = `https://example.org/annotation/${v4()}/annotation`;
    const target = `${canvasId}#xywh=${bounds.x},${bounds.y},${bounds.width},${bounds.height}`;
    setAnnotations((a) => [...a, { id, target }]);
    setIsEditing(false);
    setSelectedAnnotation(undefined);

    vault.dispatch(
      importEntities({
        entities: {
          Annotation: {
            [id]: {
              ...emptyAnnotation,
              id: id,
              // target: target,
            },
          },
        },
      })
    );

    vault.dispatch(
      addReference({
        id: pageId,
        type: "AnnotationPage",
        key: "items",
        reference: {
          id: id,
          type: "Annotation",
        },
      })
    );
  };

  const addNewAnnotationPage = () => {
    if (!canvas) return;
    const newID = `https://example.org/annotation/${v4()}/annotation-page`;
    vault.dispatch(
      importEntities({
        entities: {
          [newID]: {
            ...emptyAnnotationPage,
            id: newID,
          },
        },
      })
    );
    vault.dispatch(
      addReference({
        id: canvas.id,
        type: "Canvas",
        key: "annotations",
        reference: {
          id: newID,
          type: "AnnotationPage",
        },
      })
    );
  };

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
    pagedAnnotations,
    addNewAnnotation,
    setIsEditing,
    selectedAnnotation,
    setSelectedAnnotation,
    editAnnotation,
    onDeselect,
    addNewAnnotationPage,
  };
}

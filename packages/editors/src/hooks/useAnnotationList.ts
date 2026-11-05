import { AnnotationNormalized } from "@iiif/presentation-3-normalized";
import { useCallback, useState, useEffect } from "react";
import { addMappings, importEntities, removeReference } from "@iiif/helpers/vault/actions";

import { useAnnotationPage } from "./useAnnotationPage";
import { useCanvas, useManifest, useVault, useVaultSelector } from "react-iiif-vault";
import { emptyAnnotationPage, emptyAnnotation } from "@iiif/parser";
import { addReference } from "@iiif/helpers/vault/actions";
import { randomId } from "../helpers";

export function getInitialAnnotationList(canvasId: string) {
  return useVaultSelector(
    (state, vault) => {
      const canvas = state.iiif.entities.Canvas[canvasId];
      return (canvas?.annotations || [])
        .flatMap((page) => vault.get(page)?.items || [])
        .map((annotation) => vault.get(annotation));
    },
    [canvasId]
  );
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
  const annotations = getInitialAnnotationList(canvasId);
  const manifest = useManifest();
  const canvas = useCanvas();
  const vault = useVault();
  const pagedAnnotations = getAnnotationsByAnnotationPage(annotationPageId);
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
    if (!canvas) {
      return;
    }
    const id = `https://example.org/annotation/${randomId()}/annotation`;
    setIsEditing(false);
    setSelectedAnnotation(undefined);

    vault.batch(() => {
      vault.dispatch(
        importEntities({
          entities: {
            Annotation: {
              [id]: {
                ...emptyAnnotation,
                id: id,
                target: {
                  type: "SpecificResource",
                  source: { id: canvasId, type: "Canvas" },
                  selector: {
                    type: "FragmentSelector",
                    value: `xywh=${bounds.x},${bounds.y},${bounds.width},${bounds.height}`,
                  },
                } as any,
              },
            },
          },
        })
      );

      vault.dispatch(addMappings({ mapping: { [id]: "Annotation" } }));
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
    });
  };

  const addNewAnnotationPage = async (id?: string, label?: any, importPage?: boolean, callback?: () => void) => {
    return vault.interaction({ label: "Add annotation page" }, async (vault) => {
      if (!canvas) {
        return;
      }
      const newID = id ? id : `https://example.org/annotations/${randomId()}/annotation-page`;
      const lab = label ? label : {};
      vault.batch(() => {
        vault.dispatch(
          importEntities({
            entities: { AnnotationPage: { [newID]: { ...emptyAnnotationPage, id: newID, label: lab } } },
          })
        );
        vault.dispatch(addMappings({ mapping: { [newID]: "AnnotationPage" } }));
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
      });
      if (importPage) {
        await vault.load(newID);
      }
      if (callback) {
        callback();
      }
    });
  };

  const removeAnnotationPage = (id: string) => {
    if (!canvas) {
      return;
    }

    vault.dispatch(
      removeReference({
        id: canvas.id,
        type: "Canvas",
        key: "annotations",
        reference: {
          id: id,
          type: "AnnotationPage",
        },
      })
    );
  };

  const removeAnnotation = (id: string, pageId: string) => {
    if (!canvas) {
      return;
    }
    vault.dispatch(
      removeReference({
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
    removeAnnotationPage,
    removeAnnotation,
  };
}

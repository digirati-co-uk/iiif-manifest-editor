import { AnnotationNormalized } from "@iiif/presentation-3";
import { IIIFBuilder } from "iiif-builder";
import { useCallback, useState, useEffect } from "react";
import { importEntities } from "@iiif/vault/actions";
import { v4 } from "uuid";
import { useAnnotationPage } from "./useAnnotationPage";
import { useManifest, useVault, useVaultSelector } from "react-iiif-vault";

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
  const vault = useVault();
  const [pagedAnnotations, setPagedAnnotations] = useState<any[]>(getAnnotationsByAnnotationPage(annotationPageId));
  const annotationPage = useAnnotationPage();

  // @todo this will need to know which annotation page is being referenced
  const addNewAnnotation = useCallback(
    (
      bounds: { x: number; y: number; width: number; height: number } = {
        x: 0,
        y: 0,
        width: 100,
        height: 200,
      }
    ) => {
      const id = `https://example.org/annotation/${v4()}`;
      // we need more than these details here
      const target = `${canvasId}#xywh=${bounds.x},${bounds.y},${bounds.width},${bounds.height}`;
      setAnnotations((a) => [...a, { id, target }]);
      setIsEditing(false);
      setSelectedAnnotation(undefined);
      console.log(annotationPage);

      vault.dispatch(
        importEntities({
          entities: {
            [`${id}/annotation`]: {
              id: `${id}/annotation`,
              type: "Annotation",
              motivation: "describing",
              target: target,
              body: {
                id: v4(),
                type: "TextualBody",
                format: "text/html",
              },
            },
          },
        })
      );
    },
    []
  );

  const addNewAnnotationPage = () => {
    if (!manifest) return;
    const newID = `https://example.org/annotation/${v4()}`;
    // @todo get this working
    vault.dispatch(
      importEntities({
        entities: {
          [`${newID}/annotation-page`]: {
            id: `${newID}/annotation-page`,
            type: "AnnotationPage",
          },
        },
      })
    );
    // setAnnotations(getInitialAnnotationList(canvasId));
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

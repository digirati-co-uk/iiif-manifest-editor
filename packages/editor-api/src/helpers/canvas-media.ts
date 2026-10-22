import type { Vault } from "@iiif/helpers/vault";
import type { Reference } from "@iiif/presentation-3";

type ResourceVault = Pick<Vault, "get">;

export function canvasHasAv(vault: ResourceVault, canvasRef: Reference): boolean {
  const canvas = vault.get(canvasRef);
  const hasMedia = (ref: any): boolean => {
    if (ref?.type === "SpecificResource") return hasMedia(ref.source);
    const body = vault.get(ref);
    if (body?.type === "SpecificResource") return hasMedia(body.source);
    if (body?.type === "Choice") return (body.items || []).some(hasMedia);
    return body?.type === "Sound" || body?.type === "Video";
  };
  return (canvas?.items || []).some((pageRef: Reference) =>
    (vault.get(pageRef)?.items || []).some((annotationRef: Reference) => {
      const annotation = vault.get(annotationRef);
      return (
        [annotation?.motivation].flat().includes("painting") && [annotation?.body].flat().filter(Boolean).some(hasMedia)
      );
    })
  );
}

export function getCanvasCaptionTracks(vault: ResourceVault, canvasRef: Reference) {
  const tracks: Array<{
    body: any;
    bodyRef: any;
    bodyIndex: number;
    annotation: Reference<"Annotation">;
    page: Reference<"AnnotationPage">;
  }> = [];
  for (const pageRef of vault.get(canvasRef)?.annotations || []) {
    for (const annotationRef of vault.get(pageRef)?.items || []) {
      const annotation = vault.get(annotationRef);
      if (
        ![annotation?.motivation]
          .flat()
          .some((motivation) => ["supplementing", "captioning", "subtitling"].includes(motivation))
      )
        continue;
      [annotation?.body]
        .flat()
        .filter(Boolean)
        .forEach((bodyRef, bodyIndex) => {
          const body = vault.get(bodyRef?.type === "SpecificResource" ? bodyRef.source : bodyRef);
          if (
            body?.type === "Text" &&
            ["text/vtt", "text/srt", "application/x-subrip", "application/ttml+xml"].includes(body.format)
          ) {
            tracks.push({ body, bodyRef, bodyIndex, annotation: annotationRef, page: pageRef });
          }
        });
    }
  }
  return tracks;
}

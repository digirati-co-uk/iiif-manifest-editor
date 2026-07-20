export function targetWholeCanvas(vault: any, canvas: any, annotation: any) {
  const dimensions = annotation.body.getIIIFSelectorHeightWidth();
  vault.batch(() => {
    if (canvas && dimensions) {
      vault.modifyEntityField(
        { id: canvas.id, type: "Canvas" },
        "width",
        dimensions.width,
      );
      vault.modifyEntityField(
        { id: canvas.id, type: "Canvas" },
        "height",
        dimensions.height,
      );
    }
    annotation.target.removeSelector();
  });
}

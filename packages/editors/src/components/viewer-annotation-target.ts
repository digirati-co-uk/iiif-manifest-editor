function isFiniteBox(box: any) {
  return (
    box &&
    [box.x, box.y, box.width, box.height].every(Number.isFinite) &&
    box.width > 0 &&
    box.height > 0
  );
}

export function getSafeViewerAnnotationTarget(target: any, canvas: any) {
  if (target?.type === "BoxSelector" && isFiniteBox(target.spatial)) {
    return target;
  }

  if (
    target?.type === "SvgSelector" &&
    Array.isArray(target.points) &&
    target.points.length &&
    target.points.every(
      (point: any) =>
        Array.isArray(point) &&
        Number.isFinite(point[0]) &&
        Number.isFinite(point[1]),
    )
  ) {
    if (isFiniteBox(target.spatial)) {
      return target;
    }

    const xs = target.points.map((point: any) => point[0]);
    const ys = target.points.map((point: any) => point[1]);
    return {
      ...target,
      spatial: {
        x: Math.min(...xs),
        y: Math.min(...ys),
        width: Math.max(1, Math.max(...xs) - Math.min(...xs)),
        height: Math.max(1, Math.max(...ys) - Math.min(...ys)),
      },
    };
  }

  const width = Number(canvas?.width);
  const height = Number(canvas?.height);
  return Number.isFinite(width) && width > 0 && Number.isFinite(height) && height > 0
    ? {
        type: "BoxSelector",
        spatial: { x: 0, y: 0, width, height },
      }
    : null;
}

export function safelyGetViewerAnnotationTarget(
  getTarget: () => any,
  canvas: any,
) {
  try {
    return getSafeViewerAnnotationTarget(getTarget(), canvas);
  } catch {
    return getSafeViewerAnnotationTarget(null, canvas);
  }
}

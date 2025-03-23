export function centerRectangles(
  a: { width: number; height: number },
  b: { width: number; height: number },
  downscale = 1,
): { x: number; y: number; width: number; height: number } {
  const aAr = a.width / a.height;
  const bAr = b.width / b.height;

  if (aAr === bAr) {
    return {
      x: (a.width * (1 - downscale)) / 2,
      y: (a.height * (1 - downscale)) / 2,
      width: a.width * downscale,
      height: a.height * downscale,
    };
  }

  if (aAr < bAr) {
    const width = a.width * downscale;
    const height = b.height * (a.width / b.width) * downscale;

    return {
      x: (a.height - height) / 2,
      y: (a.width - width) / 2,
      width: width,
      height: height,
    };
  }

  const height = a.height * downscale;
  const width = b.width * (a.height / b.height) * downscale;

  return {
    x: (a.width - width) / 2,
    y: (a.height - height) / 2,
    width: width,
    height: height,
  };
}

const heightMap = {
  "h-1": "lg:min-h-[100px] row-span-1",
  "h-2": "lg:min-h-[200px] row-span-2",
  "h-3": "lg:min-h-[300px] row-span-3",
  "h-4": "lg:min-h-[400px] row-span-4",
  "h-5": "lg:min-h-[500px] row-span-5",
  "h-6": "lg:min-h-[600px] row-span-6",
  "h-7": "lg:min-h-[700px] row-span-7",
  "h-8": "lg:min-h-[800px] row-span-8",
  "h-9": "lg:min-h-[900px] row-span-9",
  "h-10": "lg:min-h-[1000px] row-span-10",
  "h-11": "lg:min-h-[1100px] row-span-11",
  "h-12": "lg:min-h-[1200px] row-span-12",
};
const previewHeightMap = {
  "h-1": "lg:min-h-[25px] row-span-1",
  "h-2": "lg:min-h-[50px] row-span-2",
  "h-3": "lg:min-h-[75px] row-span-3",
  "h-4": "lg:min-h-[100px] row-span-4",
  "h-5": "lg:min-h-[125px] row-span-5",
  "h-6": "lg:min-h-[150px] row-span-6",
  "h-7": "lg:min-h-[175px] row-span-7",
  "h-8": "lg:min-h-[200px] row-span-8",
  "h-9": "lg:min-h-[225px] row-span-9",
  "h-10": "lg:min-h-[250px] row-span-10",
  "h-11": "lg:min-h-[275px] row-span-11",
  "h-12": "lg:min-h-[300px] row-span-12",
};

const widthMap = {
  "w-1": "col-span-1",
  "w-2": "col-span-2",
  "w-3": "col-span-3",
  "w-4": "col-span-4",
  "w-5": "col-span-5",
  "w-6": "col-span-6",
  "w-7": "col-span-7",
  "w-8": "col-span-8",
  "w-9": "col-span-9",
  "w-10": "col-span-10",
  "w-11": "col-span-11",
  "w-12": "col-span-12",
};

export function getClassName(b?: string[], firstInfo = false, preview = true) {
  if (!b || b.length === 0) {
    b = ["h-8", "w-8", "image"];
  }
  let h = b.find((a) => a.includes("h-")) as keyof typeof heightMap;
  const w = b.find((a) => a.includes("w-")) as keyof typeof widthMap;
  const classNames = [];

  if (firstInfo && h === "h-4") {
    h = "h-8";
  }
  classNames.push(preview ? previewHeightMap[h] : heightMap[h]);
  classNames.push(widthMap[w]);
  return classNames.join(" ");
}

export function getGridStats(behavior?: string[]) {
  const isRight = behavior?.includes("right");
  const isLeft = behavior?.includes("left");
  const isBottom = behavior?.includes("bottom");
  const isTop = behavior?.includes("top");
  const isInfo = behavior?.includes("info");
  const isImage =
    behavior?.includes("image") || (!isLeft && !isRight && !isBottom && !isTop);

  return {
    isRight,
    isLeft,
    isBottom,
    isTop,
    isInfo,
    isImage,
  };
}

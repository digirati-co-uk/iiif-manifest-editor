import * as ort from "onnxruntime-web/wasm";
import { type OcrClassifierRun, selectOcrDifficulty } from "./ocr-difficulty";

const MODEL_URL = new URL("./assets/ocr_router_efficientnet_b0_threshold_0.15.onnx", import.meta.url).href;
const ORT_WASM_MODULE_URL = new URL("./assets/ort-wasm-simd-threaded.mjs", import.meta.url).href;
const ORT_WASM_BINARY_URL = new URL("./assets/ort-wasm-simd-threaded.wasm", import.meta.url).href;

export const MODEL_INPUT_SHAPE = [1, 3, 224, 224] as const;
export const MODEL_OUTPUT_SHAPE = [1, 3] as const;

const RESIZE_SHORT_SIDE = 256;
const IMAGE_MEAN = [0.485, 0.456, 0.406] as const;
const IMAGE_STD = [0.229, 0.224, 0.225] as const;

type LoadedImageSource = {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
};

let sessionPromise: Promise<ort.InferenceSession> | null = null;

export async function loadOcrClassifier() {
  if (!sessionPromise) {
    ort.env.wasm.wasmPaths = {
      mjs: ORT_WASM_MODULE_URL,
      wasm: ORT_WASM_BINARY_URL,
    };
    ort.env.wasm.numThreads = 1;

    sessionPromise = ort.InferenceSession.create(MODEL_URL, {
      executionProviders: ["wasm"],
      graphOptimizationLevel: "all",
    }).catch((error: unknown) => {
      sessionPromise = null;
      throw error;
    });
  }

  return sessionPromise;
}

export async function runOcrClassifier(imageBlob: Blob): Promise<OcrClassifierRun> {
  const session = await loadOcrClassifier();
  const image = await loadImageSource(imageBlob);

  try {
    const tensor = imageToTensor(image);
    const inputName = session.inputNames[0] ?? "x";
    const outputName = session.outputNames[0] ?? "linear";
    const startedAt = performance.now();
    const outputMap = await session.run({ [inputName]: tensor });
    const inferenceMs = performance.now() - startedAt;
    const outputTensor = outputMap[outputName];

    if (!outputTensor) {
      throw new Error(`Model output "${outputName}" was not returned.`);
    }

    const scores = Array.from(outputTensor.data as ArrayLike<number>).map(sigmoid);

    return {
      scores,
      prediction: selectOcrDifficulty(scores),
      inferenceMs,
    };
  } finally {
    image.dispose();
  }
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value));
}

async function loadImageSource(blob: Blob): Promise<LoadedImageSource> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });

    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      dispose: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await loadHtmlImage(objectUrl);

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      dispose: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function loadHtmlImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to decode the canvas image."));
    image.src = source;
  });
}

function imageToTensor(image: LoadedImageSource) {
  const [, channels, croppedHeight, croppedWidth] = MODEL_INPUT_SHAPE;
  const resizeScale = RESIZE_SHORT_SIDE / Math.min(image.width, image.height);
  const resizedWidth = Math.round(image.width * resizeScale);
  const resizedHeight = Math.round(image.height * resizeScale);
  const resizeCanvas = createCanvas(resizedWidth, resizedHeight);
  const resizeContext = getCanvasContext(resizeCanvas);

  resizeContext.drawImage(image.source, 0, 0, resizedWidth, resizedHeight);

  const cropX = Math.max(0, Math.floor((resizedWidth - croppedWidth) / 2));
  const cropY = Math.max(0, Math.floor((resizedHeight - croppedHeight) / 2));
  const cropCanvas = createCanvas(croppedWidth, croppedHeight);
  const cropContext = getCanvasContext(cropCanvas);

  cropContext.drawImage(resizeCanvas, cropX, cropY, croppedWidth, croppedHeight, 0, 0, croppedWidth, croppedHeight);

  const imageData = cropContext.getImageData(0, 0, croppedWidth, croppedHeight).data;
  const pixelCount = croppedWidth * croppedHeight;
  const tensorData = new Float32Array(channels * pixelCount);

  for (let pixelIndex = 0; pixelIndex < pixelCount; pixelIndex += 1) {
    const dataOffset = pixelIndex * 4;
    const red = (imageData[dataOffset] ?? 0) / 255;
    const green = (imageData[dataOffset + 1] ?? 0) / 255;
    const blue = (imageData[dataOffset + 2] ?? 0) / 255;

    tensorData[pixelIndex] = (red - IMAGE_MEAN[0]) / IMAGE_STD[0];
    tensorData[pixelCount + pixelIndex] = (green - IMAGE_MEAN[1]) / IMAGE_STD[1];
    tensorData[pixelCount * 2 + pixelIndex] = (blue - IMAGE_MEAN[2]) / IMAGE_STD[2];
  }

  return new ort.Tensor("float32", tensorData, Array.from(MODEL_INPUT_SHAPE));
}

function createCanvas(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function getCanvasContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d", { willReadFrequently: true });

  if (!context) {
    throw new Error("Could not acquire a 2D canvas context for image preprocessing.");
  }

  return context;
}

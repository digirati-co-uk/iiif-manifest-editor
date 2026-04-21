import type { ManifestEditorTag } from "@manifest-editor/shell";

export const OCR_DIFFICULTY_TAG_TYPE = "ocr-difficulty";

export type OcrDifficultyId = "easy" | "medium" | "difficult";

export type OcrDifficultyClass = {
  id: OcrDifficultyId;
  index: number;
  label: string;
  backgroundColor: string;
  textColor: string;
};

export type OcrDifficultyPrediction = OcrDifficultyClass & {
  score: number;
};

export type OcrClassifierRun = {
  scores: number[];
  prediction: OcrDifficultyPrediction;
  inferenceMs: number;
};

export const OCR_DIFFICULTY_CLASSES: OcrDifficultyClass[] = [
  {
    id: "easy",
    index: 0,
    label: "OCR Easy",
    backgroundColor: "#047857",
    textColor: "#ffffff",
  },
  {
    id: "medium",
    index: 1,
    label: "OCR Medium",
    backgroundColor: "#b45309",
    textColor: "#ffffff",
  },
  {
    id: "difficult",
    index: 2,
    label: "OCR Difficult",
    backgroundColor: "#991b1b",
    textColor: "#ffffff",
  },
];

export function selectOcrDifficulty(scores: ArrayLike<number>): OcrDifficultyPrediction {
  if (!scores.length) {
    throw new Error("OCR classifier returned no scores.");
  }

  let bestIndex = 0;
  let bestScore = Number(scores[0] ?? 0);

  for (let index = 1; index < scores.length; index += 1) {
    const score = Number(scores[index]);
    if (score > bestScore) {
      bestIndex = index;
      bestScore = score;
    }
  }

  const difficultyClass = OCR_DIFFICULTY_CLASSES[bestIndex] ?? OCR_DIFFICULTY_CLASSES[2]!;

  return {
    ...difficultyClass,
    score: bestScore,
  };
}

export function createOcrDifficultyTag(prediction: OcrDifficultyPrediction): ManifestEditorTag {
  return {
    type: OCR_DIFFICULTY_TAG_TYPE,
    id: prediction.id,
    label: prediction.label,
    backgroundColor: prediction.backgroundColor,
    textColor: prediction.textColor,
  };
}

export function formatOcrScore(score: number) {
  return `${Math.round(score * 1000) / 10}%`;
}

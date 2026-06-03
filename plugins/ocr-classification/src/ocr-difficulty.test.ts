import { describe, expect, test } from "vitest";
import {
  createOcrDifficultyTag,
  OCR_DIFFICULTY_TAG_TYPE,
  selectOcrDifficulty,
} from "./ocr-difficulty";

describe("OCR difficulty tags", () => {
  test("selects the highest scoring OCR difficulty class", () => {
    expect(selectOcrDifficulty([0.91, 0.08, 0.01])).toMatchObject({
      id: "easy",
      index: 0,
      label: "OCR Easy",
      score: 0.91,
    });
    expect(selectOcrDifficulty([0.2, 0.7, 0.3])).toMatchObject({
      id: "medium",
      index: 1,
      label: "OCR Medium",
      score: 0.7,
    });
    expect(selectOcrDifficulty([0.2, 0.4, 0.8])).toMatchObject({
      id: "difficult",
      index: 2,
      label: "OCR Difficult",
      score: 0.8,
    });
  });

  test("creates a single upsertable tag type for all OCR classes", () => {
    const tag = createOcrDifficultyTag(selectOcrDifficulty([0.1, 0.2, 0.9]));

    expect(tag).toMatchObject({
      type: OCR_DIFFICULTY_TAG_TYPE,
      id: "difficult",
      label: "OCR Difficult",
    });
  });
});

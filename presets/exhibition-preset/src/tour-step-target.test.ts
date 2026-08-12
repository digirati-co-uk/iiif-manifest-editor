import { describe, expect, test } from "vitest";
import { normaliseTourStepAnnotationResponse } from "./tour-step-target";

const canvas = { width: 1024, height: 817 };

describe("normaliseTourStepAnnotationResponse", () => {
  test("keeps a valid tour step response", () => {
    const response = {
      polygon: {
        open: false,
        points: [
          [10, 20],
          [110, 20],
          [110, 70],
          [10, 70],
        ],
      },
      boundingBox: { x: 10, y: 20, width: 100, height: 50 },
      target: { type: "FragmentSelector", value: "xywh=10,20,100,50" },
    };

    expect(normaliseTourStepAnnotationResponse(response, canvas)).toBe(response);
  });

  test("recovers a NaN SVG response to the canvas", () => {
    const response = {
      polygon: {
        open: false,
        points: [
          [Number.NaN, Number.NaN],
          [Number.NaN, Number.NaN],
          [Number.NaN, Number.NaN],
          [Number.NaN, Number.NaN],
        ],
      },
      boundingBox: {
        x: Number.NaN,
        y: Number.NaN,
        width: Number.NaN,
        height: Number.NaN,
      },
      target: {
        type: "SvgSelector",
        value:
          "<svg xmlns='http://www.w3.org/2000/svg'><path d='MNaN,NaN NaN,NaN NaN,NaN NaN,NaN' /></svg>",
      },
    };

    expect(normaliseTourStepAnnotationResponse(response, canvas)).toMatchObject({
      polygon: null,
      boundingBox: { x: 0, y: 0, width: 1024, height: 817 },
      target: {
        type: "FragmentSelector",
        value: "xywh=0,0,1024,817",
      },
    });
  });

  test("constrains an out-of-bounds response", () => {
    const response = {
      polygon: null,
      boundingBox: { x: 1000, y: 800, width: 100, height: 100 },
      target: {
        type: "SvgSelector",
        value: "<svg><path d='MNaN,NaN' /></svg>",
      },
    };

    expect(normaliseTourStepAnnotationResponse(response, canvas)).toMatchObject({
      boundingBox: { x: 924, y: 717, width: 100, height: 100 },
      target: {
        type: "FragmentSelector",
        value: "xywh=924,717,100,100",
      },
    });
  });
});

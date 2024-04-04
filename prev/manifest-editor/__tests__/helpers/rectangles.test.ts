import { centerRectangles } from "@/helpers/center-rectangles";
import { expect } from "vitest";
import { constrainPosition } from "@/helpers/constrain-position";

describe("center rectangles", function () {
  describe("constrain", function () {
    const canvas = { width: 1000, height: 1000 };
    test("negative x", () => {
      expect(
        constrainPosition(canvas, {
          x: -100,
          y: 0,
          width: 200,
          height: 200,
        })
      ).toEqual({
        x: 0,
        y: 0,
        width: 200,
        height: 200,
      });
    });
    test("negative y", () => {
      expect(
        constrainPosition(canvas, {
          x: 0,
          y: -200,
          width: 200,
          height: 200,
        })
      ).toEqual({
        x: 0,
        y: 0,
        width: 200,
        height: 200,
      });
    });
    test("oob x", () => {
      expect(
        constrainPosition(canvas, {
          x: 1100,
          y: 0,
          width: 200,
          height: 200,
        })
      ).toEqual({
        x: 800,
        y: 0,
        width: 200,
        height: 200,
      });
    });
    test("oob y", () => {
      expect(
        constrainPosition(canvas, {
          x: 0,
          y: 1200,
          width: 200,
          height: 200,
        })
      ).toEqual({
        x: 0,
        y: 800,
        width: 200,
        height: 200,
      });
    });
    test("too wide", () => {
      expect(
        constrainPosition(canvas, {
          x: 0,
          y: 1200,
          width: 2000,
          height: 300,
        })
      ).toEqual({
        x: 425,
        y: 0,
        width: 1000,
        height: 150,
      });
    });
    test("too tall", () => {
      expect(
        constrainPosition(canvas, {
          x: 0,
          y: 1200,
          width: 4000,
          height: 3000,
        })
      ).toEqual({
        x: 125,
        y: 0,
        width: 1000,
        height: 750,
      });
    });
  });

  describe("centering rectanles", () => {
    test("center same size", () => {
      expect(centerRectangles({ width: 100, height: 100 }, { width: 100, height: 100 })).toEqual({
        x: 0,
        y: 0,
        width: 100,
        height: 100,
      });
    });
    test("tall B", () => {
      expect(centerRectangles({ width: 100, height: 100 }, { width: 100, height: 200 })).toEqual({
        x: 0,
        y: 25,
        width: 50,
        height: 100,
      });
    });
    test("wide B", () => {
      expect(centerRectangles({ width: 100, height: 100 }, { width: 200, height: 100 })).toEqual({
        x: 25,
        y: 0,
        width: 100,
        height: 50,
      });
    });
    test("Nasa image", () => {
      expect(centerRectangles({ width: 1000, height: 1000 }, { width: 1000, height: 1250 }, 0.8)).toEqual({
        x: 100,
        y: 180,
        width: 640,
        height: 800,
      });
    });
  });
});

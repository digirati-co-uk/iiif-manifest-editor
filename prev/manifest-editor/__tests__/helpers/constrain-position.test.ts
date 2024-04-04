import { constrainPosition } from "@/helpers/constrain-position";

describe("constrainPosition", function () {
  test("should return position if it fits", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 0, y: 0, width: 100, height: 100 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual(position);
  });

  test("should constrain x if it is too small", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: -50, y: 0, width: 100, height: 100 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test("should constrain y if it is too small", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 0, y: -50, width: 100, height: 100 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test("should constrain x if it is too big", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 50, y: 0, width: 100, height: 100 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test("should constrain y if it is too big", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 0, y: 50, width: 100, height: 100 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test("should constrain x and y if they are too small", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: -50, y: -50, width: 100, height: 100 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test("should constrain x and y if they are too big", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 50, y: 50, width: 100, height: 100 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test("should constrain x and y if they are too small and too big", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: -50, y: 50, width: 100, height: 100 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test("should maintain aspect ratio", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 0, y: 0, width: 200, height: 100 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 25, y: 0, width: 100, height: 50 });
  });

  test("should scale down to the center of the canvas", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 0, y: 0, width: 200, height: 200 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 0, y: 0, width: 100, height: 100 });
  });

  test("should work with different aspect ratios", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 0, y: 0, width: 100, height: 200 };
    const result = constrainPosition(canvas, position);
    expect(result).toEqual({ x: 0, y: 25, width: 50, height: 100 });
  });

  test("should throw an error if canvas is too small", function () {
    const canvas = { width: 0, height: 0 };
    const position = { x: 0, y: 0, width: 100, height: 100 };
    expect(() => constrainPosition(canvas, position)).toThrowError();
  });

  test("should not throw an error if position is too small", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 0, y: 0, width: 0, height: 0 };
    expect(() => constrainPosition(canvas, position)).not.toThrowError();
  });

  test("should not throw an error if position is too big", function () {
    const canvas = { width: 100, height: 100 };
    const position = { x: 0, y: 0, width: 200, height: 200 };
    expect(() => constrainPosition(canvas, position)).not.toThrowError();
  });
});

import { labelManuscript, labelManuscriptWithoutFoliation } from "@/helpers/label-manuscript";

describe("labelManuscript", () => {
  test("returns an empty array when passed 0", () => {
    expect(labelManuscript(0, 0)).toMatchInlineSnapshot("[]");
  });

  test("returns an array with a single label when passed 1", () => {
    expect(labelManuscript(1, 0)).toMatchInlineSnapshot(`
      [
        "1r",
      ]
    `);
  });

  test("returns an array of Roman numerals when all pages are Roman numeral pages", () => {
    expect(labelManuscript(6, 3)).toMatchInlineSnapshot(`
      [
        "I",
        "II",
        "III",
        "1v",
        "1r",
        "2v",
      ]
    `);
  });

  test("returns an array of folio labels when all pages are Arabic numeral pages", () => {
    expect(labelManuscript(6, 0)).toMatchInlineSnapshot(`
      [
        "1r",
        "1v",
        "2r",
        "2v",
        "3r",
        "3v",
      ]
    `);
  });

  test("returns an array of mixed Roman and folio labels when passed 9 pages and 3 Roman numeral pages", () => {
    expect(labelManuscript(9, 3)).toMatchInlineSnapshot(`
      [
        "I",
        "II",
        "III",
        "1v",
        "1r",
        "2v",
        "2r",
        "3v",
        "3r",
      ]
    `);
  });

  test("handles edge case where total pages is less than the number of Roman numeral pages", () => {
    expect(labelManuscript(2, 4)).toMatchInlineSnapshot(`
      [
        "I",
        "II",
      ]
    `);
  });

  test("handles edge case where total pages is odd and the last page is verso", () => {
    expect(labelManuscript(5, 2)).toMatchInlineSnapshot(`
      [
        "I",
        "II",
        "1r",
        "1v",
        "2r",
      ]
    `);
  });

  test("handles edge case where total pages is even and the last page is recto", () => {
    expect(labelManuscript(6, 2)).toMatchInlineSnapshot(`
      [
        "I",
        "II",
        "1r",
        "1v",
        "2r",
        "2v",
      ]
    `);
  });

  test("handles edge case where there are no Roman numeral pages", () => {
    expect(labelManuscript(3, 0)).toMatchInlineSnapshot(`
      [
        "1r",
        "1v",
        "2r",
      ]
    `);
  });

  test("handles large number of pages", () => {
    expect(labelManuscript(100, 10)).toHaveLength(100);
  });

  test("handles large number of Roman numeral pages", () => {
    expect(labelManuscript(100, 50)).toHaveLength(100);
  });

  test("handles large number of pages with no Roman numeral pages", () => {
    expect(labelManuscript(100, 0)).toHaveLength(100);
  });

  describe("labelManuscriptWithoutFoliation", function () {
    test("returns an empty array when passed 0", () => {
      expect(labelManuscriptWithoutFoliation(0, 0)).toMatchInlineSnapshot("[]");
    });

    test("returns an array with a single label when passed 1", () => {
      expect(labelManuscriptWithoutFoliation(1, 0)).toMatchInlineSnapshot(`
        [
          "1",
        ]
      `);
    });

    test("returns an array of Roman numerals when all pages are Roman numeral pages", () => {
      expect(labelManuscriptWithoutFoliation(6, 3)).toMatchInlineSnapshot(`
        [
          "I",
          "II",
          "III",
          "1",
          "2",
          "3",
        ]
      `);
    });

    test("returns an array of folio labels when all pages are Arabic numeral pages", () => {
      expect(labelManuscriptWithoutFoliation(6, 0)).toMatchInlineSnapshot(`
        [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
        ]
      `);
    });

    test("returns an array of mixed Roman and folio labels when passed 9 pages and 3 Roman numeral pages", () => {
      expect(labelManuscriptWithoutFoliation(9, 3)).toMatchInlineSnapshot(`
        [
          "I",
          "II",
          "III",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
        ]
      `);
    });

    test("handles edge case where total pages is less than the number of Roman numeral pages", () => {
      expect(labelManuscriptWithoutFoliation(2, 4)).toMatchInlineSnapshot(`
        [
          "I",
          "II",
        ]
      `);
    });
  });
});

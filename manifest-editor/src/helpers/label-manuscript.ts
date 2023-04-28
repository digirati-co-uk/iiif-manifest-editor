export function labelManuscript(numPages: number, numRomanPages = 0) {
  const labels = [];

  // Roman numerals for initial pages
  for (let i = 1; i <= numRomanPages && i <= numPages; i++) {
    labels.push(`${toRomanNumeral(i)}`);
  }

  // Arabic numerals with foliation for remaining pages
  for (let i = numRomanPages + 1; i <= numPages; i++) {
    const folioNum = Math.ceil((i - numRomanPages) / 2);
    let folioLabel = `${folioNum}`;
    if (i % 2 === 0) {
      folioLabel += "v";
    } else {
      folioLabel += "r";
    }
    labels.push(folioLabel);
  }

  return labels;
}

const romanNumerals: any = {
  M: 1000,
  CM: 900,
  D: 500,
  CD: 400,
  C: 100,
  XC: 90,
  L: 50,
  XL: 40,
  X: 10,
  IX: 9,
  V: 5,
  IV: 4,
  I: 1,
};
function toRomanNumeral(num: number) {
  let result = "";
  for (const key in romanNumerals) {
    while (num >= romanNumerals[key]) {
      result += key;
      num -= romanNumerals[key];
    }
  }
  return result;
}

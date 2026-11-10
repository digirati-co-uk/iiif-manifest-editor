// Palettes adapted from IUBLibTech/timeliner src/config.js (MIT, see NOTICE).
export type ColourPalette = { id: string; name: string; colours: string[] };

export const colourPalettes: ColourPalette[] = [
  { id: "default", name: "Default", colours: ["#ACD4E2", "#A1F0C9", "#FFEE72", "#F4BCBA", "#D4F4EF"] },
  {
    id: "classic",
    name: "Classic",
    colours: [
      "rgb(166,202,240)",
      "rgb(255,255,120)",
      "rgb(255,200,100)",
      "rgb(200,255,200)",
      "rgb(252,215,215)",
      "rgb(209,173,209)",
      "rgb(249,188,162)",
      "rgb(156,222,235)",
      "rgb(210,210,205)",
    ],
  },
  {
    id: "pastel",
    name: "Pastel",
    colours: [
      "rgb(166,200,240)",
      "rgb(240,166,202)",
      "rgb(202,240,166)",
      "rgb(204,166,240)",
      "rgb(231,245,121)",
      "rgb(240,204,166)",
      "rgb(172,250,101)",
      "rgb(190,237,214)",
      "rgb(242,184,121)",
    ],
  },
  {
    id: "highContrast",
    name: "High contrast",
    colours: [
      "rgb(102,255,51)",
      "rgb(0,204,255)",
      "rgb(255,51,51)",
      "rgb(255,153,51)",
      "rgb(153,0,204)",
      "rgb(0,153,153)",
      "rgb(51,102,0)",
      "rgb(204,153,153)",
      "rgb(204,204,204)",
    ],
  },
  {
    id: "bright",
    name: "Bright",
    colours: [
      "rgb(245,12,12)",
      "rgb(245,250,4)",
      "rgb(5,238,6)",
      "rgb(128,255,0)",
      "rgb(9,81,246)",
      "rgb(7,0,255)",
      "rgb(151,5,210)",
      "rgb(223,4,162)",
      "rgb(241,5,5)",
    ],
  },
  {
    id: "warm",
    name: "Warm",
    colours: [
      "rgb(247,144,41)",
      "rgb(246,246,58)",
      "rgb(235,47,22)",
      "rgb(205,150,49)",
      "rgb(246,191,6)",
      "rgb(252,5,5)",
      "rgb(255,153,51)",
      "rgb(234,246,16)",
      "rgb(134,134,31)",
    ],
  },
  {
    id: "cool",
    name: "Cool",
    colours: [
      "rgb(102,102,226)",
      "rgb(69,200,69)",
      "rgb(120,197,217)",
      "rgb(0,51,202)",
      "rgb(7,120,67)",
      "rgb(150,211,204)",
      "rgb(76,55,255)",
      "rgb(102,143,255)",
      "rgb(14,252,103)",
    ],
  },
  {
    id: "earth",
    name: "Earth",
    colours: [
      "rgb(142,96,40)",
      "rgb(153,133,0)",
      "rgb(211,149,0)",
      "rgb(103,51,0)",
      "rgb(204,87,0)",
      "rgb(102,107,0)",
      "rgb(79,56,19)",
      "rgb(255,255,102)",
      "rgb(153,51,0)",
    ],
  },
  {
    id: "grayscale",
    name: "Grayscale",
    colours: [
      "rgb(225,225,225)",
      "rgb(200,200,200)",
      "rgb(175,175,175)",
      "rgb(150,150,150)",
      "rgb(125,125,125)",
      "rgb(100,100,100)",
      "rgb(75,75,75)",
      "rgb(50,50,50)",
      "rgb(25,25,25)",
    ],
  },
  // For the most common form of colour blindness.
  { id: "deuteranopia", name: "Deuteranopia", colours: ["#009192", "#B66DFF", "#DB6D01", "#25FF25"] },
];

export const backgroundColours = ["#ffffff", "#f8fafc", "#fef9c3", "#e0f2fe", "#1f2937"];

export function getPalette(id: string): ColourPalette {
  return colourPalettes.find((palette) => palette.id === id) || colourPalettes[0]!;
}

/** Bubbles are coloured by nesting level, unless the section has its own colour. */
export function bubbleColour(palette: ColourPalette, height: number, custom?: string) {
  return custom || palette.colours[(height - 1) % palette.colours.length]!;
}

function parseColour(value: string): [number, number, number] | null {
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (hex) {
    const digits = hex[1]!.length === 3 ? hex[1]!.replace(/./g, (c) => c + c) : hex[1]!;
    return [0, 2, 4].map((i) => parseInt(digits.slice(i, i + 2), 16)) as [number, number, number];
  }
  const rgb = value.match(/\d+(\.\d+)?/g);
  if (/^rgba?\(/i.test(value.trim()) && rgb && rgb.length >= 3) return rgb.slice(0, 3).map(Number) as any;
  return null;
}

/** Readable label colour for text drawn on top of a bubble. */
export function readableTextColour(background: string) {
  const rgb = parseColour(background);
  if (!rgb) return "#111827";
  const [r, g, b] = rgb.map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.4 ? "#111827" : "#ffffff";
}

/** Normalise any supported colour to #rrggbb for <input type="color">. */
export function toHexColour(value: string | undefined) {
  const rgb = value ? parseColour(value) : null;
  if (!rgb) return "#cccccc";
  return `#${rgb
    .map((n) =>
      Math.max(0, Math.min(255, Math.round(n)))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`;
}

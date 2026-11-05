import { ActionButton } from "@manifest-editor/components";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";
import { backgroundColours, colourPalettes } from "./themes";
import { useTimelinerStore } from "./store";

export function Swatches({ colours, size = 12 }: { colours: string[]; size?: number }) {
  return (
    <span className="inline-flex" aria-hidden="true">
      {colours.slice(0, 6).map((colour, i) => (
        <span
          key={`${colour}-${i}`}
          style={{ background: colour, width: size, height: size }}
          className="inline-block first:rounded-s-sm last:rounded-e-sm"
        />
      ))}
    </span>
  );
}

/** Palette, shape and background options, as in the original Timeliner's settings. */
export function ThemePicker() {
  const { palette, background, square, monochrome, setTheme } = useTimelinerStore();
  return (
    <DialogTrigger>
      <ActionButton aria-label="Theme">
        <Swatches colours={(colourPalettes.find((p) => p.id === palette) || colourPalettes[0]!).colours} /> Theme
      </ActionButton>
      <Popover placement="bottom end">
        <Dialog
          aria-label="Timeliner theme"
          className="bg-white text-me-gray-900 border border-me-gray-300 rounded-lg shadow-lg p-3 w-72 max-h-[70vh] overflow-y-auto outline-none"
        >
          <fieldset className="flex flex-col gap-1 border-0 p-0 m-0">
            <legend className="text-xs font-semibold uppercase tracking-wide text-me-gray-600 mb-1">
              Colour palette
            </legend>
            {colourPalettes.map((item) => (
              <label
                key={item.id}
                className={`flex items-center gap-2 text-sm rounded px-2 py-1 cursor-pointer hover:bg-me-gray-100 ${
                  item.id === palette ? "bg-me-primary-50 ring-1 ring-me-primary-400" : ""
                }`}
              >
                <input
                  type="radio"
                  name="vt-palette"
                  className="sr-only"
                  checked={item.id === palette}
                  onChange={() => setTheme({ palette: item.id })}
                />
                <span className="flex-1">{item.name}</span>
                <Swatches colours={item.colours} size={14} />
              </label>
            ))}
          </fieldset>
          <fieldset className="flex flex-col gap-1 border-0 p-0 m-0 mt-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-me-gray-600 mb-1">Background</legend>
            <div className="flex gap-2">
              {backgroundColours.map((colour) => (
                <button
                  key={colour}
                  type="button"
                  aria-label={`Background ${colour}`}
                  aria-pressed={background === colour}
                  onClick={() => setTheme({ background: colour })}
                  style={{ background: colour }}
                  className={`w-7 h-7 rounded-full border border-me-gray-400 ${
                    background === colour ? "ring-2 ring-me-primary-500 ring-offset-1" : ""
                  }`}
                />
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-1 mt-3 text-sm">
            <label className="flex gap-2 items-center">
              <input type="checkbox" checked={square} onChange={(e) => setTheme({ square: e.target.checked })} />
              Square bubbles
            </label>
            <label className="flex gap-2 items-center">
              <input
                type="checkbox"
                checked={monochrome}
                onChange={(e) => setTheme({ monochrome: e.target.checked })}
              />
              Black and white
            </label>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}

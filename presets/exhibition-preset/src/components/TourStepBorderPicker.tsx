import { useGenericEditor } from "@manifest-editor/shell";
import { Button, Dialog, DialogTrigger, Popover } from "react-aria-components";
import { useAnnotation } from "react-iiif-vault/presentation-4";

/**
 * A compact border-colour picker for tour step annotations. It shows a small
 * circle with the currently selected colour and, when clicked, reveals a
 * context menu of 10 fixed colours (in two rows) plus a "None" option.
 *
 * Selecting a colour updates both the annotation `stylesheet` and the target
 * `styleClass` via the editor abstraction (`target.setBorder(...)`).
 */

const BORDER_WIDTH = "3px";

// 10 fixed colours, laid out in two rows of five.
const BORDER_COLORS: Array<{ name: string; value: string }> = [
  { name: "Black", value: "#121212" },
  { name: "Red", value: "#E5484D" },
  { name: "Orange", value: "#F76B15" },
  { name: "Amber", value: "#FFB224" },
  { name: "Green", value: "#46A758" },
  { name: "Teal", value: "#12A594" },
  { name: "Blue", value: "#0091FF" },
  { name: "Indigo", value: "#3E63DD" },
  { name: "Purple", value: "#8E4EC6" },
  { name: "Pink", value: "#E93D82" },
];

function extractColor(border?: string): string | undefined {
  if (!border) return undefined;
  const match = border.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)|hsla?\([^)]*\)/);
  return match ? match[0] : undefined;
}

function sameColor(a?: string, b?: string): boolean {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

export function TourStepBorderPicker() {
  const annotation = useAnnotation();
  const editor = useGenericEditor(annotation);
  const target = editor?.annotation?.target;

  if (!annotation || !target) {
    return null;
  }

  const boxStyle = target.getBoxStyle();
  const currentColor = extractColor(boxStyle.border) ?? boxStyle.borderColor;

  const selectColor = (color: string | null) => {
    if (!color) {
      target.setBorder(undefined);
    } else {
      target.setBorder(`${BORDER_WIDTH} solid ${color}`);
    }
  };

  return (
    // The wrapping span provides the hover help text (native tooltip) for the
    // control without bloating the form.
    <span title="Choose a border colour for this tour step's highlight" className="inline-flex">
      <DialogTrigger>
        <Button
          aria-label="Tour step border colour"
          className="flex-none w-6 h-6 rounded-full border border-gray-300 shadow-sm cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-me-500"
          style={
            currentColor
              ? { backgroundColor: currentColor }
              : {
                  // Diagonal line to signify "no colour".
                  backgroundImage: "linear-gradient(45deg, transparent 45%, #d1d5db 45%, #d1d5db 55%, transparent 55%)",
                }
          }
        />
        <Popover placement="bottom" style={{ zIndex: 1000010 }}>
          {/*
            Tailwind utilities in this project are scoped to descendants of
            `.manifest-editor` (see `important: ".manifest-editor"`). The popover
            is portalled to `document.body`, so we re-establish that scope here.
          */}
          <div className="manifest-editor">
            <Dialog className="outline-none bg-white rounded-lg shadow-lg border border-gray-200 p-2">
              {({ close }) => (
                <>
                  <div className="text-[11px] font-semibold text-gray-500 px-1 pb-1.5">Border colour</div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {BORDER_COLORS.map((color) => {
                      const selected = sameColor(currentColor, color.value);
                      return (
                        <button
                          key={color.value}
                          type="button"
                          aria-label={color.name}
                          title={color.name}
                          onClick={() => {
                            selectColor(color.value);
                            close();
                          }}
                          className={`w-6 h-6 rounded-full border cursor-pointer outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-me-500 ${
                            selected ? "ring-2 ring-offset-1 ring-me-500 border-transparent" : "border-gray-300"
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    title="Remove the border colour"
                    onClick={() => {
                      selectColor(null);
                      close();
                    }}
                    className="mt-2 w-full text-[11px] text-gray-500 hover:text-me-500 rounded px-1 py-1 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-me-500"
                  >
                    None
                  </button>
                </>
              )}
            </Dialog>
          </div>
        </Popover>
      </DialogTrigger>
    </span>
  );
}

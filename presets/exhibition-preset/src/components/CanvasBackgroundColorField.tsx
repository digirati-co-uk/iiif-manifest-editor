import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";

export function CanvasBackgroundColorField({ editor }: { editor: any }) {
  const backgroundColor = editor.get() || "";

  return (
    <InputContainer $wide id={editor.containerId()}>
      <InputLabel htmlFor={editor.focusId()}>Background colour</InputLabel>
      <div className="flex min-w-0 items-center gap-2">
        <input
          id={editor.focusId()}
          aria-label="Choose background colour"
          className="h-9 w-12 shrink-0 cursor-pointer rounded border border-[#dcd5ce] bg-white p-1"
          type="color"
          value={toHexColor(backgroundColor)}
          onChange={(event) => editor.set(event.target.value)}
        />
        <Input
          aria-label="Background colour value"
          placeholder="No colour"
          value={backgroundColor}
          onChange={(event) => editor.set(event.target.value || null)}
        />
        {backgroundColor ? (
          <button
            type="button"
            className="rounded border border-[#dcd5ce] bg-white px-3 py-2 text-sm font-semibold text-[#332f2c]"
            onClick={() => editor.set(null)}
          >
            Remove
          </button>
        ) : null}
      </div>
      <p className="mt-1 text-xs text-[#6a625c]">Shown behind the image and text for this section.</p>
    </InputContainer>
  );
}

function toHexColor(value: string) {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#ffffff";
}

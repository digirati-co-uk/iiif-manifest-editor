import { useTranslations } from "@manifest-editor/i18n";
import type { ComponentProps, ReactNode } from "react";
import { type RenderSvgEditorControls, useSvgEditorControls } from "react-iiif-vault";

export type SvgEditorControlsProps = ComponentProps<typeof RenderSvgEditorControls>;

/** Uses the dependency's actions and store; display labels never become tool identifiers. */
export function SvgEditorControls({ showShapes = true, enabled, classNames = {}, icons = {} }: SvgEditorControlsProps) {
  const t = useTranslations("components");
  const { currentTool, switchTool, selectedStamp } = useSvgEditorControls();
  const controls: Array<{
    id: "pointer" | "hand" | keyof NonNullable<SvgEditorControlsProps["enabled"]>;
    icon?: ReactNode;
    active?: boolean;
    action: () => void;
  }> = [
    { id: "pointer", icon: icons.PointerIcon, active: currentTool === "pointer", action: switchTool.pointer },
    { id: "hand", icon: icons.HandIcon, active: currentTool === "hand", action: switchTool.hand },
    ...(showShapes
      ? ([
          { id: "box", icon: icons.BoxIcon, active: currentTool === "box", action: switchTool.box },
          { id: "pen", icon: icons.PenIcon, active: currentTool === "pen", action: switchTool.pen },
          { id: "draw", icon: icons.DrawIcon, active: currentTool === "pencil", action: switchTool.draw },
          { id: "line", icon: icons.LineIcon, active: currentTool === "line", action: switchTool.line },
          { id: "lineBox", icon: icons.LineBoxIcon, active: currentTool === "lineBox", action: switchTool.lineBox },
          {
            id: "triangle",
            icon: icons.TriangleIcon,
            active: currentTool === "stamp" && selectedStamp?.id === "triangle",
            action: switchTool.triangle,
          },
          {
            id: "hexagon",
            icon: icons.HexagonIcon,
            active: currentTool === "stamp" && selectedStamp?.id === "hexagon",
            action: switchTool.hexagon,
          },
          {
            id: "circle",
            icon: icons.CircleIcon,
            active: currentTool === "stamp" && selectedStamp?.id === "circle",
            action: switchTool.circle,
          },
        ] as const)
      : []),
    { id: "delete", icon: icons.DeleteForeverIcon, action: switchTool.remove },
  ];
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, minWidth: 0 }}>
      <legend className="sr-only">{t("svg.group")}</legend>
      {controls
        .filter(({ id }) => id === "pointer" || id === "hand" || !enabled || enabled[id])
        .map((control) => {
          const label = t(`svg.${control.id}`);
          return (
            <button
              type="button"
              key={control.id}
              className={classNames.button}
              title={label}
              aria-label={label}
              aria-pressed={"active" in control ? control.active : undefined}
              data-active={"active" in control ? control.active : undefined}
              onClick={control.action}
            >
              {control.icon ? <span aria-hidden="true">{control.icon}</span> : label}
            </button>
          );
        })}
    </fieldset>
  );
}

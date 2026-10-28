import { useTranslations } from "@manifest-editor/i18n";
import { getValue } from "@iiif/helpers";
import { EmptyCanvasIcon } from "@manifest-editor/components";
import cx from "classnames";
import { LocaleString, useCanvas } from "react-iiif-vault";
import { EditableCanvasLabel } from "../EditableCanvasLabel";

interface CanvasListPreviewProps {
  onClick?: () => void;
  margin?: boolean;
  active?: boolean;
  editing?: boolean;
}

export function CanvasListPreview(props: CanvasListPreviewProps) {
  const t = useTranslations("editors");
  const canvas = useCanvas();
  const Component = props.editing ? "div" : "button";
  const icon = (
    <EmptyCanvasIcon aria-hidden="true" className={cx("h-6 w-6 text-gray-300", props.active && "text-[#b84c74]")} />
  );

  return (
    <Component
      type={props.editing ? undefined : "button"}
      data-canvas-selected={props.active}
      className={cx(
        "p-1.5 cursor-pointer flex gap-1.5 bg-white border-b border-gray-200 w-full hover:bg-gray-50",
        props.active && "bg-gray-50 text-black border-[#892c4e]"
      )}
      aria-current={props.active ? "true" : undefined}
      onClick={props.editing ? undefined : props.onClick}
    >
      {props.editing ? (
        <button
          type="button"
          aria-label={t("messages.selectNamed", { label: getValue(canvas?.label) || t("ui.untitledCanvas") })}
          className="rounded-sm border-0 bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-me-primary-500"
          onClick={props.onClick}
        >
          {icon}
        </button>
      ) : (
        icon
      )}
      <div className="text-base text-ellipsis whitespace-nowrap overflow-hidden flex-1 min-w-0 text-start">
        {props.editing ? (
          <EditableCanvasLabel
            buttonClassName="w-full block"
            className="w-full block"
            placeholder={t("ui.untitledCanvas")}
          />
        ) : (
          <LocaleString defaultText={(<span className="text-gray-500">{t("ui.untitledCanvas")}</span>) as any}>
            {canvas?.label}
          </LocaleString>
        )}
      </div>
    </Component>
  );
}

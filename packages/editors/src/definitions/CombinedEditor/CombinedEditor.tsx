import { BasePropertyEditor } from "@manifest-editor/editor-api";
import { useEditor, EditorConfig } from "@manifest-editor/shell";
import { useMemo } from "react";
import { DescriptiveProperties } from "../DescriptiveProperties/DescriptiveProperties";
import { LinkingProperties } from "../LinkingProperties/LinkingProperties";
import { NavPlaceEditor } from "../NavPlaceEditor/NavPlaceEditor";
import { CanvasStructuralProperties } from "../StructuralProperties/CanvasStructuralProperties";
import { TechnicalProperties } from "../TechnicalProperties/TechnicalProperties";

export function CombinedEditor({ config }: { config: EditorConfig }) {
  const { technical, descriptive, linking, structural, extensions, notAllowed } = useEditor();
  function hideIfEmpty(editor: BasePropertyEditor<any, any>) {
    const value = editor.getWithoutTracking();
    let shouldHide = !value || value.length === 0 || value === "left-to-right";
    if (config.fields) {
      const found = config.fields.includes(editor.getProperty());
      if (found) {
        return ``;
      }
      shouldHide = true;
    }

    return `${!shouldHide ? `` : `*[id="${editor.containerId()}"]{display: none}`}`;
  }

  const type = technical.type;

  const style = useMemo(
    () => `
    ${hideIfEmpty(technical.id)}
    ${hideIfEmpty(technical.width)}
    ${hideIfEmpty(technical.height)}
    ${hideIfEmpty(technical.duration)}
    ${hideIfEmpty(technical.behavior)}
    ${hideIfEmpty(technical.format)}
    ${hideIfEmpty(technical.motivation)}
    ${hideIfEmpty(technical.viewingDirection)}
    ${hideIfEmpty(technical.mediaType)}
    ${hideIfEmpty(technical.profile)}
    ${hideIfEmpty(technical.timeMode)}

    ${hideIfEmpty(descriptive.label)}
    ${hideIfEmpty(descriptive.summary)}
    ${hideIfEmpty(descriptive.rights)}
    ${hideIfEmpty(descriptive.navDate)}
    ${hideIfEmpty(descriptive.requiredStatement)}
    ${hideIfEmpty(descriptive.provider)}
    ${hideIfEmpty(descriptive.thumbnail)}
    ${hideIfEmpty(descriptive.language)}

    ${hideIfEmpty(linking.seeAlso)}
    ${hideIfEmpty(linking.supplementary)}
    ${hideIfEmpty(linking.logo)}
    ${hideIfEmpty(linking.service)}
    ${hideIfEmpty(linking.homepage)}
    ${hideIfEmpty(linking.partOf)}
    ${hideIfEmpty(linking.rendering)}
    ${hideIfEmpty(linking.services)}
    ${hideIfEmpty(linking.start)}

    ${hideIfEmpty(structural.items)}
    ${hideIfEmpty(structural.annotations)}
    ${hideIfEmpty(structural.structures)}
    ${hideIfEmpty(extensions.navPlace)}
  `,
    [technical.id.get()]
  );

  return (
    <div>
      <style>{style}</style>
      <DescriptiveProperties />
      {type === "Canvas" ? <CanvasStructuralProperties /> : null}
      <TechnicalProperties />
      <LinkingProperties />

      {!notAllowed.includes("navPlace") && extensions.navPlace.get() ? <NavPlaceEditor /> : null}
    </div>
  );
}

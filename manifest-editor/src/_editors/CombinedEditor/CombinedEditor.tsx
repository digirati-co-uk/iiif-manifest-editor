import { DescriptiveProperties } from "@/_editors/DescriptiveProperties/DescriptiveProperties";
import { useEditor } from "@/shell/EditingStack/EditingStack";
import { BasePropertyEditor } from "@/editor-api/BasePropertyEditor";
import { TechnicalProperties } from "@/_editors/TechnicalProperties/TechnicalProperties";
import { useMemo } from "react";
import { LinkingProperties } from "@/_editors/LinkingProperties/LinkingProperties";

export function CombinedEditor() {
  const { technical, descriptive, linking } = useEditor();
  function hideIfEmpty(editor: BasePropertyEditor<any, any>) {
    const value = editor.getWithoutTracking();

    const isEmpty = !value || value.length === 0 || value === "left-to-right";

    return `${!isEmpty ? `` : `*[id="${editor.containerId()}"]{display: none}`}`;
  }

  const style = useMemo(
    () => `
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
  `,
    [technical.id.get()]
  );

  return (
    <div>
      <style>{style}</style>
      <DescriptiveProperties />
      <TechnicalProperties />
      <LinkingProperties />
    </div>
  );
}

import { useManifest } from "react-iiif-vault";
import { ResourceEditingProvider } from "@/shell";
import { supportsProperty } from "../helpers/supports-property";
import { LanguageMapEditor } from "@/editors/generic/LanguageMapEditor/LanguageMapEditor";

export type ResourceEditorConfig<T = any> = [string, T] | string;

export interface ManifestDescriptiveProps {
  supports: ResourceEditorConfig[];
  editThumbnail?(id: string): void;
  editLogo?(id: string): void;
}

export function ManifestDescriptive(props: ManifestDescriptiveProps) {
  const manifest = useManifest();
  const label = supportsProperty(props.supports, "label");
  const summary = supportsProperty(props.supports, "summary");

  return (
    <div style={{ width: "100%", padding: "0.5em" }}>
      <ResourceEditingProvider resource={manifest}>
        {label ? (
          <LanguageMapEditor
            dispatchType={"label"}
            guidanceReference={"https://iiif.io/api/presentation/3.0/#label"}
            {...label}
          />
        ) : null}
        {summary ? (
          <LanguageMapEditor
            dispatchType={"summary"}
            guidanceReference={"https://iiif.io/api/presentation/3.0/#summary"}
            {...summary}
          />
        ) : null}

        {/* @todo rights */}
        {/* @todo nav date */}
        {/*   - Browser date picker */}
        {/*   - Serialise to and from ISO */}
        {/* @todo thumbnail */}
        {/*   - Paste thumbnail image */}
        {/*   - Paste thumbnail image service (extracting both) */}
        {/*   - New thumbnail form */}
        {/*   - Deleting thumbnails */}
        {/*   - Editing thumbnail (resource/image editor) */}
        {/* @todo logo */}
        {/*   - The same as or similar to thumbnail */}
      </ResourceEditingProvider>
    </div>
  );
}

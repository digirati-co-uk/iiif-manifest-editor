import { TabPanel } from "@/components/layout/TabPanel";
import { descriptiveProperties } from "@/editor-api/meta/descriptive";
import { linkingProperties } from "@/editor-api/meta/linking";
import { resources } from "@/editor-api/meta/resources";
import { structuralProperties } from "@/editor-api/meta/structural";
import { technicalProperties } from "@/editor-api/meta/technical";
import { useApps } from "@/shell/AppContext/AppContext";
import { useEditingResource } from "@/shell/EditingStack/EditingStack";
import { useState } from "react";

export function CompatibilityTable() {
  const [selected, setSelected] = useState(0);

  const tabs = resources.all.map((resource) => ({
    label: resource,
    renderComponent: () => (
      <div style={{ padding: "0 2em" }}>
        <h3>{resource}</h3>
        <CompatibleType type={resource} />
      </div>
    ),
  }));

  return <TabPanel menu={tabs} selected={selected} switchPanel={setSelected} />;
}

export function CompatibleType({ type }: { type: string }) {
  const supported = resources.supported[type as "Manifest"];

  return (
    <div>
      <h4>Technical</h4>
      <SingleSetTable type={type} group="technical" properties={technicalProperties.all} supports={supported} />
      <h4>Descriptive</h4>
      <SingleSetTable type={type} group="descriptive" properties={descriptiveProperties.all} supports={supported} />
      <h4>Linking</h4>
      <SingleSetTable type={type} group="linking" properties={linkingProperties.all} supports={supported} />
      <h4>Structural</h4>
      <SingleSetTable type={type} group="structural" properties={structuralProperties.all} supports={supported} />
    </div>
  );
}

export function SingleSetTable({
  type,
  group,
  properties,
  supports,
}: {
  type: string;
  group: string;
  properties: readonly string[];
  supports: { allowed: string[]; required: string[]; recommended: string[]; notAllowed: string[]; optional: string[] };
}) {
  const { apps, currentApp } = useApps();
  const resource = useEditingResource();
  const selectedApp = currentApp ? apps[currentApp.id] : null;

  const editors = selectedApp?.layout.editors || [];
  const supportedEditors = editors.filter((editor) => {
    if (!editor.supports.resourceTypes.includes(type)) {
      return false;
    }
    let overlap = false;
    for (const field of editor.supports.properties) {
      if (properties.includes(field)) {
        overlap = true;
        break;
      }
    }
    if (!overlap) {
      return false;
    }

    return true;
  });

  const combined = supportedEditors.length
    ? supportedEditors.reduce(
        (state, next) => {
          return {
            readonly: [
              ...state.readonly,
              ...(next.supports.readOnlyProperties || []).filter((p) => !state.readonly.includes(p)),
            ],
            properties: [...state.properties, ...next.supports.properties.filter((p) => !state.readonly.includes(p))],
          };
        },
        { readonly: [], properties: [] } as { readonly: string[]; properties: string[] }
      )
    : null;

  return (
    <table border={1}>
      <thead>
        <tr>
          <td></td>
          {properties.map((prop) => (
            <td>{prop}</td>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Spec</td>
          {properties.map((prop) => (
            <td>
              {supports.notAllowed.includes(prop) ? (
                <img src="https://iiif.io/api/assets/images/icons/not_allowed.png" />
              ) : supports.optional.includes(prop) ? (
                <img src="https://iiif.io/api/assets/images/icons/optional.png" />
              ) : supports.recommended.includes(prop) ? (
                <img src="https://iiif.io/api/assets/images/icons/recommended.png" />
              ) : supports.required.includes(prop) ? (
                <img src="https://iiif.io/api/assets/images/icons/required.png" />
              ) : (
                "N/A"
              )}
            </td>
          ))}
        </tr>
        {combined ? (
          <tr>
            <td>All editors</td>
            {properties.map((prop) => {
              if (supports.notAllowed.includes(prop)) {
                return <td>-</td>;
              }
              if (combined.properties.includes(prop)) {
                return (
                  <td>
                    <img src="https://iiif.io/api/assets/images/icons/required.png" />
                  </td>
                );
              }
              if (combined.readonly.includes(prop)) {
                return (
                  <td>
                    <img src="https://iiif.io/api/assets/images/icons/optional.png" />
                  </td>
                );
              }
              return (
                <td>
                  <img src="https://iiif.io/api/assets/images/icons/not_allowed.png" />
                </td>
              );
            })}
          </tr>
        ) : null}
        <tr>
          <td colSpan={properties.length + 1}>
            {supportedEditors.length ? (
              <td>Built editors</td>
            ) : (
              <td>
                <strong>No current editors</strong>
              </td>
            )}
          </td>
        </tr>
        {supportedEditors.map((editor) => {
          return (
            <tr>
              <td>{editor.label}</td>
              {properties.map((prop) => {
                if (supports.notAllowed.includes(prop)) {
                  return <td>-</td>;
                }
                if (editor.supports.properties.includes(prop)) {
                  return (
                    <td>
                      <img src="https://iiif.io/api/assets/images/icons/required.png" />
                    </td>
                  );
                }
                if (editor.supports.readOnlyProperties?.includes(prop)) {
                  return (
                    <td>
                      <img src="https://iiif.io/api/assets/images/icons/optional.png" />
                    </td>
                  );
                }
                return (
                  <td>
                    <img src="https://iiif.io/api/assets/images/icons/not_allowed.png" />
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

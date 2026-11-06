import { useEditorI18n, useTranslations } from "@manifest-editor/i18n";
import { useVault } from "react-iiif-vault";
import { useMemo, useState } from "react";
import { type CreatableResource, matchBasedOnResource } from "@manifest-editor/creator-api";
import { useApp } from "../AppContext/AppContext";
import { Tab, TabList, TabPanel, Tabs } from "@manifest-editor/components";
import { RenderCreator } from "./BaseCreator";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "../ShellContext/default-theme";

interface BaseAnnotationCreatorProps {
  resource: CreatableResource;
  onCreate: () => void;
}

export function BaseAnnotationCreator(props: BaseAnnotationCreatorProps) {
  const { resolveMessage } = useEditorI18n();

  const t = useTranslations("shell");

  const vault = useVault();
  const app = useApp();
  const supported = useMemo(
    () =>
      matchBasedOnResource(props.resource, app.layout.creators || [], {
        vault,
      }),
    [props.resource, app.layout.creators, vault]
  );
  const [selected, setSelected] = useState<string | number | null>(null);
  const current = supported.find((item) => item.id === selected) || supported[0];

  if (supported.length === 0) {
    return <div className="p-4 text-sm text-gray-500">{t("creator.noCreators")}</div>;
  }

  return (
    <Tabs className="flex w-full flex-col" selectedKey={current?.id} onSelectionChange={setSelected}>
      {supported.length > 1 ? (
        <TabList
          aria-label={t("creator.annotationType")}
          className="mx-3 mt-3 flex gap-0.5 rounded-md bg-gray-100 p-0.5 text-sm"
          items={supported}
        >
          {(item) => (
            <Tab
              id={item.id}
              className={({ isSelected, isFocusVisible }) =>
                [
                  "flex min-w-0 flex-auto items-center justify-center gap-1.5 rounded border-b-0 px-2 py-1 font-medium",
                  isSelected ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900",
                  isFocusVisible ? "bg-white ring-2 ring-me-primary-500" : "",
                ].join(" ")
              }
            >
              <span aria-hidden className="flex flex-none text-base [&>svg]:h-4 [&>svg]:w-4">
                {item.icon}
              </span>
              <span className="truncate">{resolveMessage(item?.labelMessage, item.label)}</span>
            </Tab>
          )}
        </TabList>
      ) : null}
      {resolveMessage(current?.summaryMessage, current?.summary) ? (
        <p className="mx-4 mt-2 text-xs text-gray-500">{resolveMessage(current?.summaryMessage, current?.summary)}</p>
      ) : null}
      {supported.map((item) => {
        return (
          <TabPanel key={item.id} id={item.id} className="p-3 pt-2 outline-none">
            <ThemeProvider theme={defaultTheme}>
              <RenderCreator
                creator={item}
                resource={props.resource}
                onCreate={props.onCreate}
                skipEditingOnCreate
                compact
              />
            </ThemeProvider>
          </TabPanel>
        );
      })}
    </Tabs>
  );
}

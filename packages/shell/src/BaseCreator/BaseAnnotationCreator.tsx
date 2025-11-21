import { useVault } from "react-iiif-vault";
import { useMemo } from "react";
import {
  type CreatableResource,
  matchBasedOnResource,
} from "@manifest-editor/creator-api";
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
  const {} = props;
  const vault = useVault();
  const app = useApp();
  const supported = useMemo(
    () =>
      matchBasedOnResource(props.resource, app.layout.creators || [], {
        vault,
      }),
    [props.resource, app.layout.creators, vault],
  );

  if (supported.length === 0) {
    return <div>No supported creators found</div>;
  }

  return (
    <div>
      <Tabs className="w-full flex-1 overflow-hidden flex flex-col">
        <TabList
          className="flex-1 overflow-hidden w-full flex text-sm whitespace-nowrap"
          items={supported}
        >
          {(item) => <Tab id={item.id}>{item.label}</Tab>}
        </TabList>
        {supported.map((item) => {
          return (
            <TabPanel key={item.id} id={item.id} className="p-2">
              <ThemeProvider theme={defaultTheme}>
                <RenderCreator
                  creator={item}
                  resource={props.resource}
                  onCreate={props.onCreate}
                  skipEditingOnCreate
                />
              </ThemeProvider>
            </TabPanel>
          );
        })}
      </Tabs>
    </div>
  );
}

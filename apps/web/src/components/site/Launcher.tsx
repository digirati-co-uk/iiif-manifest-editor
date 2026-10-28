"use client";
import { useTranslations } from "@manifest-editor/i18n";
import { Tab, TabList, TabPanel, Tabs } from "@manifest-editor/components";
import { Suspense } from "react";
import { TutorialListing } from "../tutorials/TutorialListing";
import BrowserRecents from "../browser-editor/BrowserRecents";
import GettingStarted from "../browser-editor/GettingStarted";
import { ExampleListing } from "../example-listing/ExampleListing";
import { HandleQueryString } from "../query-string/HandleQueryString";

export function Launcher({
  defaultTab,
  examples,
}: {
  defaultTab: string;
  examples: Parameters<typeof ExampleListing>[0]["examples"];
}) {
  const webT = useTranslations("web");
  return (
    <div className="bg-white">
      <HandleQueryString />

      <GettingStarted />

      <div className="px-8">
        <Tabs className="" key={defaultTab} defaultSelectedKey={defaultTab}>
          <TabList aria-label={webT("launcher.tabs")} className="my-4">
            <Tab className="" id="recent">
              {webT("launcher.recentTab")}
            </Tab>
            <Tab className="" id="examples">
              {webT("launcher.examples")}
            </Tab>
            <Tab id="tutorials">{webT("launcher.tutorials")}</Tab>
          </TabList>
          <TabPanel className="" id="recent">
            <Suspense>
              <BrowserRecents />
            </Suspense>
          </TabPanel>
          <TabPanel className="" id="examples">
            <ExampleListing examples={examples} />
          </TabPanel>
          <TabPanel id="tutorials">
            <TutorialListing />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

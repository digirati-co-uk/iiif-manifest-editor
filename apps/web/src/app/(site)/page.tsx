import { Tab, TabList, TabPanel, Tabs } from "@manifest-editor/components";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Suspense } from "react";
import allExamples from "../../../../../examples.json";
import BrowserRecents from "../../components/browser-editor/BrowserRecents";
import GettingStarted from "../../components/browser-editor/GettingStarted";
import { ExampleListing } from "../../components/example-listing/ExampleListing";
import { HandleQueryString } from "../../components/query-string/HandleQueryString";

const { examples } = allExamples;

export default async function Page({ searchParams }: { searchParams: { tab?: string } }) {
  const defaultTab = searchParams.tab || "recent";

  return (
    <div className="bg-white">
      <HandleQueryString />

      <GettingStarted />

      <div className="px-8">
        <Tabs className="" key={defaultTab} defaultSelectedKey={defaultTab}>
          <TabList aria-label="Get started with Manifest Editor" className="my-4">
            <Tab className="" id="recent">
              Recent
            </Tab>
            <Tab className="" id="examples">
              Examples
            </Tab>
          </TabList>
          <TabPanel className="" id="recent">
            <Suspense>
              <BrowserRecents />
            </Suspense>
          </TabPanel>
          <TabPanel className="" id="examples">
            <ExampleListing examples={examples} />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

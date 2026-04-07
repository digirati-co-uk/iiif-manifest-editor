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

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const defaultTab = (await searchParams).tab || "recent";

  return (
    <div className="bg-white">

      <div className="flex items-center gap-3 px-4 py-2 bg-[#EE3B76] text-white">
        <div className="relative mr-2 w-6 h-6 flex items-center justify-center" aria-hidden="true">
          <span className="absolute inline-flex w-full h-full rounded-full bg-[white] opacity-30 animate-ping" />
          <span className="relative inline-flex w-2 h-2 rounded-full bg-[white] shadow-md" />
        </div>
        Join us now for the <a className="text-white underline" href="https://workshop.exhibitionviewer.org/">IIIF Exhibition Building Workshop</a>
      </div>
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

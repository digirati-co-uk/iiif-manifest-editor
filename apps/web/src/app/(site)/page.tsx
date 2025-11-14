import { Tab, TabList, TabPanel, Tabs } from "@manifest-editor/components";
import dynamic from "next/dynamic";
import Link from "next/link";

import allExamples from "../../../../../examples.json";
import { ExampleListing } from "../../components/example-listing/ExampleListing";
import { HandleQueryString } from "../../components/query-string/HandleQueryString";

const { examples } = allExamples;

const BrowserRecents = dynamic(() => import("../../components/browser-editor/BrowserRecents"), { ssr: false });

const GettingStarted = dynamic(() => import("../../components/browser-editor/GettingStarted"), { ssr: false });

export default async function Page({ searchParams }: { searchParams: { tab?: string } }) {
  const defaultTab = searchParams.tab || "recent";

  return (
    <div className="bg-white">
      <HandleQueryString />

      <GettingStarted />

      <div className="px-8">
        <Tabs className="" key={defaultTab} defaultSelectedKey={defaultTab}>
          <TabList aria-label="Get started with Manifest Editor" className="my-4">
            <Tab id="recent">Recent</Tab>
            <Tab id="examples">Examples</Tab>
          </TabList>
          <TabPanel id="recent">
            <BrowserRecents />
          </TabPanel>
          <TabPanel id="examples">
            <ExampleListing examples={examples} />
          </TabPanel>
        </Tabs>
      </div>
    </div>
  );
}

import { Tab, TabList, TabPanel, Tabs } from "@manifest-editor/components";
import Link from "next/link";
import dynamic from "next/dynamic";

import allExamples from "../../../../../examples.json";
import { ExampleListing } from "../../components/example-listing/ExampleListing";

const { examples } = allExamples;

const BrowserRecents = dynamic(() => import("../../components/browser-editor/BrowserRecents"), { ssr: false });

const GettingStarted = dynamic(() => import("../../components/browser-editor/GettingStarted"), { ssr: false });

export default function Page(): JSX.Element {
  return (
    <div className="bg-white">
      <GettingStarted />

      <div className="px-8">
        <Tabs>
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
      <div className="bg-slate-200 p-5 rounded flex gap-5 mt-10">
        <div className="">Looking for the legacy editor?</div>
        <div>
          <Link
            // Button
            className="bg-me-primary-500 hover:bg-me-primary-600 text-sm text-white py-2 px-4 rounded"
            href="/legacy"
          >
            Launch legacy editor
          </Link>
        </div>
      </div>
    </div>
  );
}

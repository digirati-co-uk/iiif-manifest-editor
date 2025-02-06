import { Tab, TabList, TabPanel, Tabs } from "@manifest-editor/components";
import Link from "next/link";
import dynamic from "next/dynamic";

import allExamples from "../../../../../examples.json";
import { ExampleListing } from "../../components/example-listing/ExampleListing";
import { HandleQueryString } from "../../components/query-string/HandleQueryString";

const { examples } = allExamples;
import { cookies } from 'next/headers'

const BrowserRecents = dynamic(() => import("../../components/browser-editor/BrowserRecents"), { ssr: false });

const GettingStarted = dynamic(() => import("../../components/browser-editor/GettingStarted"), { ssr: false });

export default async function Page(): Promise<JSX.Element> {

  const cookieStore = await cookies();

  const defaultTab = cookieStore.get('tab')?.value;

  return (
    <div className="bg-white">
      <HandleQueryString />

      <GettingStarted />

      <div className="px-8">
        <Tabs defaultSelectedKey={defaultTab}>
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
      <div className="bg-slate-200 p-5 rounded flex gap-5 mt-10 m-8">
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

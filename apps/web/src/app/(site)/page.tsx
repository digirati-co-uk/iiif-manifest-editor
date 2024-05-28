import Link from "next/link";
import { Tab, TabList, TabPanel, Tabs } from "@manifest-editor/components";

export default function Page(): JSX.Element {
  return (
    <div className="bg-white">
      <div className="bg-me-gray-100 py-8 px-6 border-b">
        <h2 className="text-2xl mb-6">Get started</h2>
        <div className="flex gap-3">
          <div className="w-28 flex items-center flex-col group cursor-default">
            <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-32 flex items-center justify-center">
              <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white">
                A
              </div>
            </div>
            <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">New manifest</div>
          </div>
          <div className="w-28 flex items-center flex-col group cursor-default">
            <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-32 flex items-center justify-center">
              <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white">
                A
              </div>
            </div>
            <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Paste link</div>
          </div>
          <div className="w-28 flex items-center flex-col group cursor-default">
            <div className="bg-me-gray-300 group-hover:bg-me-gray-300/60 rounded w-full h-32 flex items-center justify-center">
              <div className="w-10 h-10 flex items-center justify-center bg-me-primary-500 rounded-full text-white">
                A
              </div>
            </div>
            <div className="text-sm mt-2 text-center group-hover:text-black text-black/70">Open file</div>
          </div>
        </div>
      </div>

      <div className="px-8">
        <Tabs>
          <TabList aria-label="Get started with Manifest Editor" className="my-4">
            <Tab id="recent">Recent</Tab>
            <Tab id="examples">Examples</Tab>
          </TabList>
          <TabPanel id="recent">
            <div>TODO: Recent manifests</div>
          </TabPanel>
          <TabPanel id="examples">
            <div>TODO: Examples</div>
            <div>
              <a className="underline underline-offset-2" href="/examples/iiif-manifest-example">
                iiif-manifest-example
              </a>
            </div>
          </TabPanel>
        </Tabs>

        <h1 className="text-5xl my-20">IIIF Manifest Editor</h1>

        <div className="flex gap-4">
          <Link
            // Button
            className="bg-gray-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
            href="/legacy"
          >
            Go to editor
          </Link>

          <Link
            // Button
            className="bg-gray-300 hover:bg-slate-200 text-slate-800 py-2 px-4 rounded"
            href="/docs"
          >
            Documentation
          </Link>
        </div>
        <div className="mt-32 prose">
          <h2 className="text-2xl my-4">What's IIIF?</h2>
          <p>
            IIIF, pronounced "triple-eye-eff", is a set of standards for working with digital objects on the web, such
            as digitised books, manuscripts, artworks, movies and audio. It's typically used by galleries, libraries,
            archives and museums to present their collections and make them <i>interoperable</i> - they become available
            to software such as viewers, annotation tools, digital exhibits and more.{" "}
            <a href="https://iiif.io/" target="_blank">
              Learn more at iiif.io
            </a>
            .
          </p>

          <h2>What's a Manifest?</h2>
          <p>
            A Manifest is the <i>The unit of distribution</i> of IIIF. It's like a web page, but instead of HTML for
            browsers, it contains JSON data for IIIF-compatible viewers and other software. A IIIF Viewer loads a
            Manifest and generates the UI to allow the user to navigate around, e.g., from page to page of a book, or
            from scene to scene of an opera. This Manifest Editor allows you to create new Manifests - from scratch, or
            by adapting existing ones.
          </p>

          <h2>Canvases</h2>
          <p>
            A Canvas is a bit like a PowerPoint slide - the virtual space that content is arranged on. A Manifest has
            one or more of these "slides" - for example, one for each page of a book - and each slide has content - most
            commonly, one image filling the whole Canvas. Rather than a Manifest having a simple list of images, it has
            a sequence of Canvases, and each Canvas has one (or sometimes more) images (or AV content).
          </p>
        </div>
      </div>
    </div>
  );
}

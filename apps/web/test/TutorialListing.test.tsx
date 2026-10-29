import { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { afterEach, expect, it, vi } from "vitest";
import { TutorialListing } from "../src/components/tutorials/TutorialListing";
import { tutorials } from "../src/components/tutorials/tutorials";
import { createWebI18n } from "../src/i18n/WebI18nProvider";
const io = vi.hoisted(() => ({ list: vi.fn(), create: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: io.push }) }));
vi.mock("@manifest-editor/shell", () => ({ NOTEBOOK_PANEL_ID: "@manifest-editor/notebook" }));
vi.mock("../src/components/browser-editor/browser-state", () => ({
  listBrowserProjects: io.list,
  createNotebookProject: io.create,
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
const roots: { unmount(): void }[] = [];
afterEach(async () => {
  await act(async () => roots.splice(0).forEach((root) => root.unmount()));
  document.body.innerHTML = "";
  vi.clearAllMocks();
});
async function mount() {
  const runtime = createWebI18n({ locale: "nl" });
  await runtime.select({});
  const node = document.createElement("div");
  document.body.appendChild(node);
  const root = createRoot(node);
  roots.push(root);
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={runtime}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <TutorialListing />
        </QueryClientProvider>
      </EditorI18nProvider>
    )
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  return { node, runtime };
}
it("renders translated tutorial details and seeds a new Dutch working copy once", async () => {
  io.list.mockResolvedValue([]);
  io.create.mockResolvedValue({ id: "new-tutorial" });
  const { node, runtime } = await mount();
  expect(node.textContent).toContain("10 minuten · Geen ervaring nodig");
  expect(node.textContent).toContain("Uw eerste afbeeldingsmanifest");
  await act(async () => node.querySelector("button")!.click());
  expect(io.create).toHaveBeenCalledOnce();
  const input = io.create.mock.calls[0]![0];
  expect(input.markdown).toContain("# Uw eerste afbeeldingsmanifest");
  expect(input.markdown).toContain("**width: 1200**");
  expect(input.markdown).toContain(tutorials[0]!.thumbnail);
  expect(input.noteId).toBe(tutorials[0]!.id);
  expect(input.source).toEqual({ id: tutorials[0]!.source.url, type: "Tutorial" });
  await act(async () => runtime.setLocale("en-GB"));
  expect(io.create).toHaveBeenCalledOnce();
  expect(tutorials[0]!.markdown).toContain("# Your first image manifest");
});
it("continues an existing tutorial without rewriting its authored notebook", async () => {
  const existing = {
    id: "saved-project",
    extraData: { tutorial: { id: tutorials[0]!.id } },
    notebook: { markdown: "Fy nodiadau Cymraeg" },
  };
  io.list.mockResolvedValue([existing]);
  const { node, runtime } = await mount();
  await act(async () => runtime.setProfile("plain"));
  expect(node.querySelector("button")?.textContent).toBe("Verder met handleiding");
  await act(async () => node.querySelector("button")!.click());
  expect(io.push).toHaveBeenCalledExactlyOnceWith("/editor/saved-project?leftPanel=%40manifest-editor%2Fnotebook");
  expect(io.create).not.toHaveBeenCalled();
  expect(existing.notebook.markdown).toBe("Fy nodiadau Cymraeg");
});

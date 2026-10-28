import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { createWebI18n } from "../src/i18n/WebI18nProvider";
import { CreateFromUrlModal } from "../src/components/browser-editor/CreateFromUrlModal";

const services = vi.hoisted(() => ({
  analyse: vi.fn(),
  createManifest: vi.fn(),
  createCollection: vi.fn(),
  push: vi.fn(),
}));
// Keep actual rendering/providers; replace only navigation and import I/O.
vi.mock("@manifest-editor/components", async () => import("../../../packages/components/src/Modal"));
vi.mock("@manifest-editor/shell", () => ({ analyse: services.analyse }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: services.push }) }));
vi.mock("posthog-js", () => ({ default: { capture: vi.fn() } }));
vi.mock("../src/components/browser-editor/browser-state", () => ({
  createManifestFromId: services.createManifest,
  createCollectionFromId: services.createCollection,
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
vi.stubGlobal(
  "ResizeObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
);
vi.stubGlobal("CSS", { escape: (value: string) => value });
Element.prototype.scrollIntoView = () => {};
const roots: { unmount(): void }[] = [];
afterEach(async () => {
  await act(async () => roots.splice(0).forEach((root) => root.unmount()));
  document.body.innerHTML = "";
  vi.clearAllMocks();
});
async function mount() {
  const runtime = createWebI18n({ locale: "nl" });
  const node = document.createElement("div");
  document.body.appendChild(node);
  const root = createRoot(node);
  roots.push(root);
  await act(async () =>
    root.render(
      <EditorI18nProvider instance={runtime}>
        <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
          <CreateFromUrlModal isOpen setIsOpen={() => {}} />
        </QueryClientProvider>
      </EditorI18nProvider>
    )
  );
  return runtime;
}
async function settle() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}

it("retains a real URL field through locale/profile changes and localizes failed import feedback", async () => {
  services.analyse.mockRejectedValue(new Error("technical network failure"));
  const runtime = await mount();
  expect(document.querySelector('[role="dialog"]')?.textContent).toContain("Een manifest via een URL openen");
  const input = document.querySelector<HTMLInputElement>('input[name="iiif-manifest"]')!;
  input.value = "https://example.org/cy/manifest";
  await act(async () => runtime.setProfile("plain"));
  await act(async () => runtime.setLocale("en-GB"));
  expect(document.querySelector('input[name="iiif-manifest"]')).toBe(input);
  expect(input.value).toBe("https://example.org/cy/manifest");
  await act(async () => runtime.setLocale("nl"));
  await act(async () =>
    document.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  );
  await settle();
  expect(services.analyse).toHaveBeenCalledExactlyOnceWith("https://example.org/cy/manifest");
  expect(document.querySelector('[role="alert"]')?.textContent).toContain("Het manifest kon niet worden geopend.");
  expect(services.createManifest).not.toHaveBeenCalled();
});

it("announces collection loading and failures and preserves the imported protocol object", async () => {
  const collection = { id: "https://example.org/collection", type: "Collection", label: { cy: ["Casgliad"] } };
  services.analyse.mockResolvedValue(collection);
  let reject!: (reason: Error) => void;
  services.createCollection.mockImplementation(
    () =>
      new Promise((_, no) => {
        reject = no;
      })
  );
  await mount();
  document.querySelector<HTMLInputElement>('input[name="iiif-manifest"]')!.value = collection.id;
  await act(async () =>
    document.querySelector("form")!.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  );
  await settle();
  expect(document.body.textContent).toContain("Manifest openen…");
  expect(document.querySelector<HTMLInputElement>('input[name="iiif-manifest"]')!.disabled).toBe(true);
  expect(services.createCollection.mock.calls[0]?.[0]).toBe(collection);
  expect(collection.label).toEqual({ cy: ["Casgliad"] });
  await act(async () => reject(new Error("database rejected")));
  await settle();
  expect(document.querySelector('[role="alert"]')?.textContent).toContain("Controleer de URL");
  expect(document.querySelector<HTMLInputElement>('input[name="iiif-manifest"]')!.disabled).toBe(false);
});

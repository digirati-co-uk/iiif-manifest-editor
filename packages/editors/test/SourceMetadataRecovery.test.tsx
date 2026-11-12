import { act, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, expect, test, vi } from "vitest";
import { ResourceMetadataContent } from "../src/definitions/Metadata/ResourceMetadata";
import { clearSourceManifestCache } from "../src/definitions/Metadata/metadata-tools";

const model = vi.hoisted(() => ({
  current: [] as any[],
  refs: [{ id: "https://example.org/source", type: "ContentResource" }],
}));
vi.mock("@manifest-editor/shell", () => ({
  useConfig: () => ({}),
  useSpecifications: () => [],
  useEditor: () => ({
    ref: () => ({ id: "https://example.org/canvas", type: "Canvas" }),
    descriptive: {
      metadata: {
        get: () => model.current,
        add: (label: unknown, value: unknown) => { model.current = [...model.current, { label, value }]; },
      },
      requiredStatement: { get: () => null },
    },
    linking: { partOf: { get: () => model.refs } },
  }),
}));
vi.mock("@manifest-editor/components", () => ({
  AddIcon: () => null,
  ActionButton: ({ children, onPress, ...props }: any) => <button {...props} onClick={onPress}>{children}</button>,
}));
vi.mock("../src/definitions/Metadata/Metadata", () => ({
  Metadata: ({ children, embedded }: { children: ReactNode; embedded?: boolean }) => (
    <div data-embedded={embedded}>{children}</div>
  ),
}));

let root: Root | undefined;
let container: HTMLDivElement;
afterEach(async () => {
  await act(async () => root?.unmount());
  container?.remove();
  clearSourceManifestCache();
  vi.unstubAllGlobals();
});

const item = (label: string, value: string) => ({ label: { en: [label] }, value: { en: [value] } });

test("source disclosure counts unique missing fields, hides added fields, and updates after recovery", async () => {
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  const creator = item("Creator", "A painter");
  const title = item("Title", "A portrait");
  const date = item("Date", "1900");
  model.current = [creator];
  vi.stubGlobal("fetch", vi.fn(async () => ({
    ok: true,
    json: async () => ({
      id: model.refs[0]!.id, type: "Manifest", label: { en: ["aureus"] },
      metadata: [creator, title, date],
      items: [{ id: "https://example.org/canvas", type: "Canvas", metadata: [title] }],
    }),
  })));
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
  const render = () => root!.render(<ResourceMetadataContent embedded />);
  await act(async () => render());

  const button = (label: string) => Array.from(container.querySelectorAll("button")).find(
    (node) => (node.getAttribute("aria-label") || node.textContent)?.trim() === label,
  )!;
  const click = async (node: HTMLButtonElement) => {
    await act(async () => { node.click(); render(); });
  };
  const disclosure = button("Original source metadata, 2 missing fields");
  expect(disclosure.getAttribute("aria-expanded")).toBe("false");
  expect(container.querySelector("li")).toBeNull();
  expect(container.querySelector("[data-embedded=true]")).not.toBeNull();

  await click(disclosure);
  expect(container.querySelectorAll("li")).toHaveLength(2);
  expect(container.textContent).not.toContain("A painter");
  expect(container.textContent).not.toContain("aureus");
  expect(container.textContent).not.toContain("Source manifest");
  expect(container.querySelector("a")).toBeNull();

  await click(button("Show all fields"));
  expect(container.querySelectorAll("li")).toHaveLength(3);
  expect(button("Hide already added").getAttribute("aria-pressed")).toBe("true");
  await click(button("Hide already added"));
  expect(container.querySelectorAll("li")).toHaveLength(2);

  await click(button("Add Title back"));
  expect(button("Original source metadata, 1 missing field")).not.toBeNull();
  expect(container.querySelectorAll("li")).toHaveLength(1);
  expect(model.current).toEqual([creator, title]);
  await click(button("Add Date back"));
  expect(button("Original source metadata, 0 missing fields")).not.toBeNull();
  expect(container.textContent).toContain("All added");
  expect(container.querySelectorAll("li")).toHaveLength(0);
});

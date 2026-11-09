import { act, type ReactNode, useState } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeAll, expect, it, vi } from "vitest";
import { createEditorI18n, defaultLocales, dutchLocale } from "@manifest-editor/i18n/core";
import { EditorI18nProvider } from "@manifest-editor/i18n";
import { dutchCatalogs, dutchPlain } from "@manifest-editor/i18n/nl";
import { ManifestOverviewEmptyState } from "../src/ManifestOverviewEmptyState";
import { BackgroundActionMenuProgressBar } from "../src/BackgroundActionsMenu";
import { MoreMenuButton } from "../src/MoreMenuButton";
import { CreatorGrid } from "../src/CreatorGrid";
import { PanelSideMenu } from "../src/PanelSideMenu";
import { SidebarTabs } from "../src/SidebarTabs";
import { SidebarHeader } from "../src/Sidebar";
import { Modal } from "../src/Modal";
import { useGridOptions } from "../src/hooks/use-grid-options";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
beforeAll(() => {
  Object.assign(globalThis, { CSS: { escape: (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "\\$&") } });
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
  window.matchMedia = vi.fn().mockImplementation(() => ({
    matches: false,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
  }));
  HTMLElement.prototype.scrollIntoView = vi.fn();
});
const roots: ReturnType<typeof createRoot>[] = [];
afterEach(async () => {
  await act(async () => {
    for (const root of roots.splice(0)) root.unmount();
  });
  document.body.innerHTML = "";
  localStorage.clear();
});
async function mount(element: ReactNode) {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  roots.push(root);
  await act(async () => root.render(element));
  return container;
}
function runtime() {
  return createEditorI18n({
    locales: [...defaultLocales, dutchLocale],
    catalogs: dutchCatalogs,
    profiles: { plain: dutchPlain },
  });
}
it("uses English standalone and updates built-in controls without changing actions or progress", async () => {
  const standalone = await mount(<MoreMenuButton />);
  expect(standalone.querySelector("button")?.getAttribute("aria-label")).toBe("More actions");
  const i18n = runtime();
  const create = vi.fn();
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <ManifestOverviewEmptyState canCreate onCreate={create} />
      <BackgroundActionMenuProgressBar percent={37.4} />
    </EditorI18nProvider>
  );
  const button = container.querySelector("button")!;
  await act(async () => {
    await i18n.setLocale("nl");
  });
  expect(button.textContent).toBe("Inhoud toevoegen");
  expect(container.querySelector("[role=progressbar]")?.getAttribute("aria-label")).toBe(
    "Voortgang van achtergrondactie"
  );
  expect(container.querySelector("[role=progressbar]")?.getAttribute("aria-valuenow")).toBe("37");
  await act(async () => (button as HTMLButtonElement).click());
  expect(create).toHaveBeenCalledTimes(1);
});
it("resolves deferred creator metadata live, retaining legacy labels and stable IDs", async () => {
  const i18n = runtime();
  const click = vi.fn();
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <CreatorGrid
        label="My creators"
        items={[
          {
            id: "create/blank",
            icon: null,
            title: "Legacy title",
            description: "Legacy description",
            titleMessage: { namespace: "components", key: "onboarding.start" },
            descriptionMessage: { namespace: "components", key: "onboarding.title" },
            onClick: click,
          },
          {
            id: "custom",
            icon: null,
            title: "Welsh caller label",
            description: "Authored description",
            onClick: click,
          },
        ]}
      />
    </EditorI18nProvider>
  );
  const option = container.querySelector("[role=option]")!;
  const id = option.id;
  expect(option.getAttribute("aria-label")).toBe("Start adding content");
  await act(async () => {
    await i18n.setLocale("nl");
  });
  expect(option.getAttribute("aria-label")).toBe("Inhoud toevoegen");
  // React Aria uses textContent on Safari/VoiceOver instead of aria-describedby.
  expect(option.querySelector('[slot="description"]')?.textContent).toBe("Aan de slag!");
  expect(option.id).toBe(id);
  expect(container.textContent).toContain("Welsh caller label");
  await act(async () => {
    (option as HTMLElement).focus();
    option.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true }));
    option.dispatchEvent(new KeyboardEvent("keyup", { key: "Enter", code: "Enter", bubbles: true }));
  });
  expect(click).toHaveBeenCalledTimes(1);
});
it("retains grid size and localStorage keys across locale and wording changes", async () => {
  const i18n = runtime();
  function Grid() {
    const [options, control] = useGridOptions("my-grid");
    return (
      <>
        <output>{options.size}</output>
        {control}
      </>
    );
  }
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <Grid />
    </EditorI18nProvider>
  );
  await act(async () => {
    (container.querySelectorAll("button")[2] as HTMLButtonElement).click();
  });
  expect(container.querySelector("output")?.textContent).toBe("grid-lg");
  await act(async () => {
    await i18n.setLocale("nl");
    await i18n.setProfile("plain");
  });
  expect(container.textContent).toContain("Rastergrootte:");
  expect(container.querySelector("output")?.textContent).toBe("grid-lg");
  expect(localStorage.getItem("my-grid")).toContain("grid-lg");
});
it("updates panel metadata while preserving active tabs and mounted form state", async () => {
  const i18n = runtime();
  let mounts = 0;
  function Draft() {
    const [draft] = useState(() => {
      mounts++;
      return "Teitl Cymraeg";
    });
    return <input defaultValue={draft} />;
  }
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <PanelSideMenu
        open
        current="info"
        items={[
          {
            id: "info",
            label: "Legacy",
            labelMessage: { namespace: "components", key: "onboarding.start" },
            icon: null,
            onClick() {},
          },
        ]}
      />
      <SidebarTabs
        menuId="editor"
        selectedKey="info"
        menu={[
          {
            id: "info",
            label: "Legacy",
            labelMessage: { namespace: "components", key: "onboarding.start" },
            renderComponent: () => <Draft />,
          },
        ]}
      />
    </EditorI18nProvider>
  );
  const input = container.querySelector("input")!;
  input.value = "Unsaved Welsh";
  await act(async () => {
    await i18n.setLocale("nl");
  });
  expect(container.querySelector("nav")?.getAttribute("aria-label")).toBe("Bewerkingspanelen");
  expect(container.querySelector("[role=tab]")?.textContent).toBe("Inhoud toevoegen");
  expect(container.querySelector("[role=tab]")?.getAttribute("aria-selected")).toBe("true");
  expect(container.querySelector("input")).toBe(input);
  expect(input.value).toBe("Unsaved Welsh");
  expect(mounts).toBe(1);
});
it("scopes a portalled modal and localises its close button without altering caller content", async () => {
  const i18n = runtime();
  const close = vi.fn();
  await mount(
    <EditorI18nProvider instance={i18n}>
      <Modal title="Teitl" onClose={close}>
        Authored children
      </Modal>
    </EditorI18nProvider>
  );
  await act(async () => {
    await i18n.setLocale("nl");
  });
  const modal = document.querySelector(".manifest-editor-modal")!;
  expect(modal.getAttribute("lang")).toBe("nl");
  expect(modal.textContent).toContain("Authored children");
  const button = modal.querySelector("button[type=button]")!;
  expect(button.textContent).toBe("Sluiten");
  await act(async () => (button as HTMLButtonElement).click());
  expect(close).toHaveBeenCalledTimes(1);
});

it("preserves authored IIIF provider labels and vault data while translating the edit action", async () => {
  const { Vault } = await import("@iiif/helpers/vault");
  const { VaultProvider } = await import("react-iiif-vault");
  const { ViewProvider } = await import("../src/ViewProvider");
  const vault = new Vault();
  const manifest = {
    id: "https://example.org/manifest",
    type: "Manifest",
    label: { cy: ["Teitl Cymraeg"] },
    provider: [{ id: "https://example.org/provider", type: "Agent", label: { cy: ["Llyfrgell Cymru"] } }],
    items: [],
  };
  await vault.load(manifest.id, manifest);
  const before = JSON.stringify(vault.getState());
  const i18n = runtime();
  const edit = vi.fn();
  const container = await mount(
    <EditorI18nProvider instance={i18n}>
      <VaultProvider vault={vault}>
        <ViewProvider resource={{ id: "https://example.org/provider", type: "Agent" }} onPress={edit} />
        <SidebarHeader title={manifest.label} titleMessage={{ namespace: "components", key: "onboarding.start" }} />
      </VaultProvider>
    </EditorI18nProvider>
  );
  const button = container.querySelector("button")!;
  expect(button.getAttribute("aria-label")).toBe("Edit Llyfrgell Cymru");
  await act(async () => {
    await i18n.setLocale("nl");
  });
  expect(button.getAttribute("aria-label")).toBe("Llyfrgell Cymru bewerken");
  expect(button.textContent).toContain("Llyfrgell Cymru");
  expect(container.querySelector("h1")?.textContent).toBe("Teitl Cymraeg");
  await act(async () => button.click());
  expect(edit).toHaveBeenCalledTimes(1);
  expect(JSON.stringify(vault.getState())).toBe(before);
  expect(manifest.label).toEqual({ cy: ["Teitl Cymraeg"] });
});

it("translates a queued toast in its portal while retaining caller content and dismissal behavior", async () => {
  const { useToastState } = await import("@react-stately/toast");
  const { ToastRegion } = await import("../src/Toast");
  const i18n = runtime();
  let enqueue!: () => void;
  function ToastHarness() {
    const state = useToastState<{ title: string }>({ maxVisibleToasts: 3 });
    enqueue = () => {
      state.add({ title: "Caller supplied title" });
    };
    return <ToastRegion state={state} />;
  }
  await mount(
    <EditorI18nProvider instance={i18n}>
      <ToastHarness />
    </EditorI18nProvider>
  );
  await act(async () => enqueue());
  await act(async () => {
    await i18n.setLocale("nl");
  });
  expect(document.querySelector('[role="region"][aria-label="Meldingen"]')).not.toBeNull();
  const toast = document.querySelector('[role="alertdialog"]')!;
  expect(toast.textContent).toContain("Caller supplied title");
  const close = toast.querySelector('[aria-label="Sluiten"]') as HTMLButtonElement;
  expect(close).not.toBeNull();
  expect(close.closest("[lang]")?.getAttribute("lang")).toBe("nl");
  await act(async () => close.click());
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
});

it("remeasures translated overflow tabs even when they were already hidden", async () => {
  const original = HTMLElement.prototype.getBoundingClientRect;
  const measurement = vi
    .spyOn(HTMLElement.prototype, "getBoundingClientRect")
    .mockImplementation(function (this: HTMLElement) {
      const rect = original.call(this);
      if (this.getAttribute("role") === "tablist") return { ...rect, width: 180 };
      if (this.getAttribute("role") === "tab") {
        const hidden = this.classList.contains("hidden") && this.style.display !== "block";
        return { ...rect, width: hidden ? 0 : this.textContent === "Inhoud toevoegen" ? 200 : 100 };
      }
      return rect;
    });
  try {
    const i18n = runtime();
    const container = await mount(
      <EditorI18nProvider instance={i18n}>
        <SidebarTabs
          menuId="overflow"
          selectedKey="a"
          menu={["a", "b", "c"].map((id) => ({
            id,
            label: "Legacy",
            labelMessage: { namespace: "components", key: "onboarding.start" },
            renderComponent: () => <span>Caller panel</span>,
          }))}
        />
      </EditorI18nProvider>
    );
    // React Aria commits collection item refs after the parent layout effect.
    // Allow the existing 500ms resize observer interval to measure the initial collection.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 550));
    });
    expect(container.querySelectorAll('[role="tab"].hidden')).toHaveLength(2);
    await act(async () => {
      await i18n.setLocale("nl");
    });
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 550));
    });
    expect(container.querySelectorAll('[role="tab"].hidden')).toHaveLength(3);
    expect(container.querySelector('[aria-label="Meer tabbladen"]')).not.toBeNull();
    expect(container.querySelector('[role="tabpanel"]')?.textContent).toBe("Caller panel");
  } finally {
    measurement.mockRestore();
  }
});

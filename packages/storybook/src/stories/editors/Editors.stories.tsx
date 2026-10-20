import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { EditorWorkbench } from "../../support/EditorWorkbench";
import { resources } from "../../support/resources";

const descriptive = "@manifest-editor/descriptive-properties";
const overview = "@manifest-editor/overview";

const meta = {
  title: "Editors/Resource panels",
  component: EditorWorkbench,
  args: {
    title: "Manifest descriptive properties",
    summary:
      "Edit a real Cookbook Manifest using the production editor panel. Every change appears in the serialized JSON; Reset loads a fresh resource.",
    resource: resources.image,
    target: "manifest",
    selectedTab: descriptive,
  },
  argTypes: {
    resource: { control: "text", description: "Remote IIIF Presentation 3 resource URL." },
    target: { control: "inline-radio", options: ["manifest", "canvas"] },
    selectedTab: {
      control: "select",
      options: [
        descriptive,
        "@manifest-editor/metadata",
        "@manifest-editor/technical-properties",
        "@manifest-editor/linking-properties",
        overview,
      ],
    },
    config: { control: "object" },
  },
} satisfies Meta<typeof EditorWorkbench>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ManifestDescriptiveProperties: Story = {};

export const MultilingualLabelsAndSummaries: Story = {
  args: {
    title: "Multilingual labels and summaries",
    summary:
      "The Cookbook language example keeps its original language maps. Add languages or values and inspect the resulting IIIF JSON.",
    resource: resources.multilingual,
    config: {
      i18n: {
        defaultLanguage: "en",
        availableLanguages: ["en", "nl", "fr", "de", "ja", "zh"],
        advancedLanguageMode: true,
      },
    },
  },
};

export const MetadataEntries: Story = {
  args: {
    title: "Metadata entries",
    summary:
      "Add, edit, delete and reorder metadata on a real multipage Cookbook book. Labels and values retain their language maps.",
    resource: resources.book,
    selectedTab: "@manifest-editor/metadata",
  },
};

export const RightsAndRequiredStatement: Story = {
  args: {
    title: "Rights and required statement",
    summary:
      "Edit the rights URI and attribution on the loaded Manifest. Add a required statement if the source has none; these changes stay in this story.",
    resource: resources.book,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const rights = await canvas.findByRole("combobox", { name: /^Rights$/ }, { timeout: 30000 });
    const originalRights = (rights as HTMLInputElement).value;
    const value = "https://creativecommons.org/licenses/by/4.0/";
    await userEvent.clear(rights);
    await userEvent.type(rights, value);
    const json = canvas.getByRole("complementary", { name: "Live resource JSON" });
    await waitFor(() => expect(JSON.parse(json.querySelector("code")!.textContent!).rights).toBe(value));
    await userEvent.click(canvas.getByRole("button", { name: /^Reset$/ }));
    const resetRights = await canvas.findByRole("combobox", { name: /^Rights$/ }, { timeout: 30000 });
    await expect(resetRights).toHaveValue(originalRights);
  },
};

export const TechnicalPropertiesAndBehavior: Story = {
  args: {
    title: "Technical properties and behavior",
    summary:
      "Explore viewing direction and behavior on the multipage book. Switch the target control to canvas for dimensions and duration.",
    resource: resources.book,
    selectedTab: "@manifest-editor/technical-properties",
  },
};

export const LinkingProperties: Story = {
  args: {
    title: "Linking properties",
    summary:
      "Inspect and edit seeAlso, rendering, homepage, partOf and start links. Add actions open the real creator dialog, and nested resources use the editor stack.",
    resource: resources.book,
    selectedTab: "@manifest-editor/linking-properties",
  },
};

export const CanvasDescriptiveProperties: Story = {
  args: {
    title: "Canvas descriptive properties",
    summary:
      "Edit the first Canvas in the Cookbook book, with the parent Manifest context available. The JSON panel shows this Canvas rather than the whole book.",
    resource: resources.book,
    target: "canvas",
  },
};

export const RestrictedPropertyConfiguration: Story = {
  args: {
    title: "Restricted property configuration",
    summary:
      "The production Overview editor is configured to expose label, summary, rights and required statement. The original source properties remain in the live JSON.",
    selectedTab: overview,
    config: {
      editorConfig: {
        Manifest: {
          singleTab: overview,
          onlyTabs: [overview],
          fields: ["label", "summary", "rights", "requiredStatement"],
        },
      },
    },
  },
};

export const SingleTabEditorConfiguration: Story = {
  args: {
    title: "Single-tab editor configuration",
    summary:
      "The real BaseEditor uses singleTab and onlyTabs to show descriptive properties without its normal tab strip. Change config in Controls to compare configurations.",
    config: { editorConfig: { Manifest: { singleTab: descriptive, onlyTabs: [descriptive] } } },
  },
};

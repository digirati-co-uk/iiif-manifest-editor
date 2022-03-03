import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { AddManifestModal } from "../components/modals/AddManifestModal";

export default {
  title: "Manifest Editor/AddManifestModal",
  component: AddManifestModal
} as ComponentMeta<typeof AddManifestModal>;

const Template: ComponentStory<typeof AddManifestModal> = args => (
  <AddManifestModal {...args} />
);

export const AnExample = Template.bind({});

AnExample.args = {
  manifest: undefined,
  close: () => {console.log("close clicked")},
};

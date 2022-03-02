import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { AddModal } from "../components/molecules/AddModal";

export default {
  title: "Manifest Editor/AddModal",
  component: AddModal
} as ComponentMeta<typeof AddModal>;

const Template: ComponentStory<typeof AddModal> = args => (
  <AddModal {...args} />
);

export const AnExample = Template.bind({});
AnExample.args = {
  manifest: undefined
};


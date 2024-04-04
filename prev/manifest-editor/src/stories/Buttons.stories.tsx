import * as React from "react";
import { Button, CalltoButton, SecondaryButton } from "../atoms/Button";
import { ComponentMeta, ComponentStory } from "@storybook/react";

export default {
  title: "Manifest Editor/Buttons",
  component: Button,
} as ComponentMeta<typeof Button>;

const Template: ComponentStory<typeof Button> = (args) => {
  return (
    <div>
      <Button>This is a plain button for housing icons/text etc.</Button>
      <br />
      <CalltoButton>A call to action button</CalltoButton>
      <br />
      <SecondaryButton>A secondary button</SecondaryButton>
    </div>
  );
};

export const AnExample = Template.bind({});

AnExample.args = {};

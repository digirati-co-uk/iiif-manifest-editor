import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useState } from "react";
import { InputContainer, InputLabel } from "../../components/Input";
import { InlineSelect } from "./InlineSelect";

export default { title: "Inline Select", panel: "right" };

export const Default = () => {
  const [value, setValue] = useState("thing-b");

  return (
    <PaddedSidebarContainer>
      <InputContainer $fluid>
        <InputLabel htmlFor="my-thing2">Test label ({value})</InputLabel>
        <InlineSelect
          onDeselect={() => setValue("")}
          value={value}
          onChange={setValue}
          name="my-thing"
          id="my-thing2"
          options={[
            {
              label: { en: ["Thing a"] },
              value: "thing-a",
            },
            {
              label: { en: ["Thing b"] },
              value: "thing-b",
            },
            {
              label: { en: ["Thing c"] },
              value: "thing-c",
            },
          ]}
        />
      </InputContainer>
    </PaddedSidebarContainer>
  );
};

export const Long = () => {
  const [value, setValue] = useState("thing-b");

  return (
    <PaddedSidebarContainer>
      <InputContainer $fluid>
        <InputLabel htmlFor="my-thing2">Test label ({value})</InputLabel>
        <InlineSelect
          onDeselect={() => setValue("")}
          value={value}
          onChange={setValue}
          name="my-thing"
          id="my-thing2"
          options={[
            {
              label: { en: ["Thing a"] },
              value: "thing-a",
            },
            {
              label: { en: ["Thing b"] },
              value: "thing-b",
            },
            {
              label: { en: ["Thing c"] },
              value: "thing-c",
            },
            {
              label: { en: ["Thing D"] },
              value: "thing-d",
            },
            {
              label: { en: ["Thing E"] },
              value: "thing-e",
            },
          ]}
        />
      </InputContainer>
    </PaddedSidebarContainer>
  );
};

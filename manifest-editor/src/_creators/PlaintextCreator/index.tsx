import { CreatorDefinition } from "@/creator-api";
import { CreatePlaintextForm, createPlaintext } from "./create-plaintext";
import { TextFormatIcon } from "@/icons/TextFormatIcon";

export const plaintextCreator: CreatorDefinition = {
  id: "@manifest-editor/plaintext-creator",
  create: createPlaintext,
  label: "Plaintext",
  summary: "Add link to an plaintext",
  icon: <TextFormatIcon />,
  render(ctx) {
    return <CreatePlaintextForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["label", "format"],
  supports: {
    parentFields: ["seeAlso", "rendering", "homepage"],
  },
  staticFields: {
    format: "text/plain",
  },
};

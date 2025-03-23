import type { CreatorDefinition } from "@manifest-editor/creator-api";
import { TextFormatIcon } from "@manifest-editor/ui/icons/TextFormatIcon";
import {
  CreatePlaintextForm,
  createPlaintext,
  type CreatePlaintextPayload,
} from "./create-plaintext";

export const plaintextCreator: CreatorDefinition<CreatePlaintextPayload> = {
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

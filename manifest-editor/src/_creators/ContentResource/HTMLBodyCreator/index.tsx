import { CreatorDefinition } from "@/creator-api";
import { CreateHTMLBodyForm, createHtmlBody } from "./create-html-body";
import textFormatIcon from "@/icons/TextFormatIcon.svg";
import React from "react";

export const htmlBodyCreator: CreatorDefinition = {
  id: "@manifest-editor/html-body-creator",
  create: createHtmlBody,
  label: "HTML Body",
  summary: "Add HTML annotation body",
  icon: <img src={textFormatIcon} alt="" />,
  render(ctx) {
    return <CreateHTMLBodyForm {...ctx} />;
  },
  resourceType: "ContentResource",
  resourceFields: ["id", "language", "type", "format", "value"],
  supports: {
    parentTypes: ["Annotation"],
    parentFields: ["body"],
  },
  staticFields: {
    type: "TextualBody",
    format: "text/html",
  },
};

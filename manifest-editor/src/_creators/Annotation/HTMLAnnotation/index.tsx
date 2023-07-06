import { CreatorDefinition } from "@/creator-api";
import textFormatIcon from "@/icons/TextFormatIcon.svg";
import React from "react";
import { CreateHTMLAnnotation, createHtmlAnnotation } from "./create-html-annotation";

export const htmlAnnotation: CreatorDefinition = {
  id: "@manifest-editor/html-annotation",
  create: createHtmlAnnotation,
  label: "HTML Annotation",
  summary: "Add HTML annotation",
  icon: <img src={textFormatIcon} alt="" />,
  render(ctx) {
    return <CreateHTMLAnnotation {...ctx} />;
  },
  resourceType: "Annotation",
  resourceFields: ["id", "type", "motivation", "body", "target"],
  additionalTypes: ["Canvas"],
  supports: {
    initialData: true,
    parentTypes: ["AnnotationPage", "Manifest"],
    parentFields: ["items"],
  },
  staticFields: {
    type: "Annotation",
  },
};

import type { MetaRecord } from "nextra";

const meta: MetaRecord = {
  index: {
    type: "page",
    theme: {
      layout: "default",
      toc: false,
      timestamp: false,
      typesetting: "article",
    },
  },
  docs: {
    type: "page",
    title: "User guide",
  },
  developer: {
    type: "page",
    title: "Developers",
  },
};

export default meta;

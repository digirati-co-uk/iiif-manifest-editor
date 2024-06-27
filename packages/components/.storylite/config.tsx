import type { SLAppComponentProps } from "@storylite/storylite";

const config: Partial<SLAppComponentProps> = {
  title: " ME Components",
  defaultStory: "index-index",
  useIframeStyles: false,
  iframeProps: {
    style: {
      // padding: '10px',
    },
  },
  addons: [],
};

export default config;

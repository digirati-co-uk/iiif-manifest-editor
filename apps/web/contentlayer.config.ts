import { makeSource } from "@contentlayer2/source-files";
import highlight from "rehype-highlight";
import { contentDirPath } from "./src/contentlayer/utils";
import { Doc } from "./src/contentlayer/Doc";

export default makeSource({
  contentDirPath,
  documentTypes: {
    Doc,
  },
  mdx: { rehypePlugins: [highlight] },
});

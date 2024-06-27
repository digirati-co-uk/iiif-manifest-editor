import { Doc } from "contentlayer/generated";

export type TreeNode = {
  title: string;
  nav_title: string | null;
  label: string | null;
  excerpt: string | null;
  urlPath: string;
  children: TreeNode[];
  collapsible: boolean | null;
  collapsed: boolean | null;
};

export type PathSegment = { order: number; pathName: string };

export const buildDocsTree = (docs: Doc[], parentPathNames: string[] = []): TreeNode[] => {
  const level = parentPathNames.length;

  // Remove ID from parent path
  // parentPathNames = parentPathNames.join("/").split("-").slice(0, -1).join("-").split("/");

  return docs
    .filter(
      (_) =>
        _.pathSegments.length === level + 1 &&
        _.pathSegments
          .map((_: PathSegment) => _.pathName)
          .join("/")
          .startsWith(parentPathNames.join("/"))
    )
    .sort((a, b) => a.pathSegments[level].order - b.pathSegments[level].order)
    .map<TreeNode>((doc) => ({
      nav_title: doc.nav_title ?? null,
      title: doc.title,
      label: doc.label ?? null,
      excerpt: doc.excerpt ?? null,
      urlPath: doc.url_path,
      collapsible: doc.collapsible ?? null,
      collapsed: doc.collapsed ?? null,
      children: buildDocsTree(
        docs,
        doc.pathSegments.map((_: PathSegment) => _.pathName)
      ),
    }));
};

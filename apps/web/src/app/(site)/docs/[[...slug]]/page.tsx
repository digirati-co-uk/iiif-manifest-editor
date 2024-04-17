import { Doc, allDocs } from "contentlayer/generated";
import { PathSegment, buildDocsTree } from "../../../../contentlayer/utils/build-docs-tree";
import { useMDXComponent } from "next-contentlayer2/hooks";
import { DocsNavigation } from "../../../../components/docs/DocsNavigation";
import { Card } from "../../../../components/docs/Card";
import { Label } from "../../../../components/docs/Label";
import Link from "next/link";

interface DocsPageProps {
  params: { slug: string[] };
}

const mdxComponents = {};

function getDoc(slug: string[]) {
  if (!slug) return allDocs.find((_) => _.url_path === "/docs");
  return allDocs.find((_) => _.url_path === `/docs/${slug.join("/")}`);
}

export default async function DocsPage(props: DocsPageProps) {
  const doc = getDoc(props.params.slug);
  if (!doc) return { notFound: true };
  const thing = { doc, ...getSupportingProps(doc, props.params) };

  const activePath = props.params.slug ? `/docs/${props.params.slug.join("/")}` : "/docs";

  // useLiveReload();
  const MDXContent = useMDXComponent(doc.body.code || "");
  return (
    <div className="relative w-full mx-auto max-w-screen-2xl lg:flex lg:items-start">
      <div
        style={{ height: "calc(100vh - 64px)" }}
        className="sticky hidden border-r border-gray-200 top-16 shrink-0 dark:border-gray-800 lg:block"
      >
        <div className="h-full p-8 pl-16 -ml-3 overflow-y-auto">
          <DocsNavigation tree={thing.tree} activePath={activePath} />
        </div>
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-t from-white/0 to-white/100 dark:from-gray-950/0 dark:to-gray-950/100" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-white/0 to-white/100 dark:from-gray-950/0 dark:to-gray-950/100" />
      </div>

      <div className="relative w-full grow">
        {/* <DocsHeader tree={tree} breadcrumbs={breadcrumbs} title={doc.title} /> */}
        <div className="w-full max-w-3xl p-4 pb-8 mx-auto mb-4 prose docs prose-slate prose-violet shrink prose-headings:font-semibold prose-a:font-normal prose-code:font-normal prose-code:before:content-none prose-code:after:content-none prose-hr:border-gray-200 dark:prose-invert dark:prose-a:text-violet-400 dark:prose-hr:border-gray-800 md:mb-8 md:px-8 lg:mx-0 lg:max-w-full lg:px-16">
          {MDXContent && <MDXContent components={mdxComponents as any} />}

          {doc.show_child_cards && (
            <>
              <hr />
              <div className="grid grid-cols-1 gap-6 mt-12 md:grid-cols-2">
                {thing.childrenTree.map((card: any, index: number) => (
                  <Link key={index} href={card.urlPath} className="cursor-pointer no-underline">
                    <Card className="h-full p-6 py-4 hover:border-violet-100 hover:bg-violet-50 dark:hover:border-violet-900/50 dark:hover:bg-violet-900/20">
                      <h3 className="mt-0 no-underline">{card.title}</h3>
                      {card.label && <Label text={card.label} />}
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        <p>{card.excerpt}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </>
          )}
          {/* <DocsFooter doc={doc} /> */}
        </div>
      </div>
      <div
        style={{ maxHeight: "calc(100vh - 128px)" }}
        className="sticky top-32 hidden w-80 shrink-0 overflow-y-scroll p-8 pr-16 1.5xl:block"
      >
        {/* <PageNavigation headings={doc.headings} /> */}
        <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-t from-white/0 to-white/100 dark:from-gray-950/0 dark:to-gray-950/100" />
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-b from-white/0 to-white/100 dark:from-gray-950/0 dark:to-gray-950/100" />
      </div>
    </div>
  );
}

function getSupportingProps(doc: Doc, params: any) {
  let slugs = params.slug ? ["docs", ...params.slug] : [];
  let path = "";
  let breadcrumbs: any = [];
  for (const slug of slugs) {
    path += `/${slug}`;
    const breadcrumbDoc = allDocs.find((_) => _.url_path === path || _.url_path_without_id === path);
    if (!breadcrumbDoc) continue;
    breadcrumbs.push({ path: breadcrumbDoc.url_path, title: breadcrumbDoc?.nav_title || breadcrumbDoc?.title });
  }
  const tree = buildDocsTree(allDocs);
  const childrenTree = buildDocsTree(
    allDocs,
    doc.pathSegments.map((_: PathSegment) => _.pathName)
  );
  return { tree, breadcrumbs, childrenTree };
}

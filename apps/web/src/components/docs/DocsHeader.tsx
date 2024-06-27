"use client";
import { Fragment, useState, useEffect } from "react";
import Link from "next/link";
import { DocsNavigation } from "./DocsNavigation";

import { TreeNode } from "../../contentlayer/utils/build-docs-tree";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import { usePathname } from "next/navigation";
import { CloseIcon } from "@manifest-editor/ui/madoc/components/icons/CloseIcon";

interface DocHeaderProps {
  tree: TreeNode[];
  breadcrumbs: any[];
  title: string;
}

function RightArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" height="14" viewBox="0 0 24 24" width="14">
      <path d="M0 0h24v24H0V0z" fill="none" />
      <path d="M9.29 6.71c-.39.39-.39 1.02 0 1.41L13.17 12l-3.88 3.88c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l4.59-4.59c.39-.39.39-1.02 0-1.41L10.7 6.7c-.38-.38-1.02-.38-1.41.01z" />
    </svg>
  );
}

export function DocsHeader({ tree, breadcrumbs, title }: DocHeaderProps) {
  const pathname = usePathname();

  const [open, setOpen] = useState<boolean>(false);
  const [top, setTop] = useState<boolean>(true);

  useEffect(() => {
    const handleScroll = () => setTop(window.scrollY <= 30);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="relative w-full">
        <div className="mx-auto w-full max-w-3xl space-y-2 px-4 py-8 md:px-8 lg:max-w-full lg:px-16">
          <ul className="-mx-1 flex flex-wrap items-center text-sm">
            {breadcrumbs.map(({ path, title }, index) => (
              <Fragment key={index}>
                {index < breadcrumbs.length - 1 && (
                  <li className="mx-1 flex items-center space-x-2">
                    <Link
                      href={path}
                      className="inline whitespace-nowrap hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      {title}
                    </Link>
                    {index < breadcrumbs.length - 2 ? (
                      <span className="inline-block w-1.5 text-slate-400 dark:text-slate-500 mr-1.5">
                        <RightArrow />
                      </span>
                    ) : null}
                  </li>
                )}
              </Fragment>
            ))}
          </ul>
          <h1 className="sr-only text-2xl font-semibold text-slate-800 dark:text-slate-200 md:text-3xl lg:not-sr-only lg:text-4xl">
            {title}
          </h1>
          <div className="lg:hidden">
            <button
              aria-label="Show docs navigation"
              onClick={() => setOpen(true)}
              className="flex space-x-2 text-left text-2xl font-semibold text-slate-800 dark:text-slate-200 md:space-x-3 md:text-3xl lg:text-4xl"
            >
              <span className="mt-1.5 inline-block w-4 flex-shrink-0 md:w-5">
                <DownIcon />
              </span>
              <span className="inline-block flex-shrink">{title}</span>
            </button>
          </div>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 h-screen bg-gray-950/10 pb-20 backdrop-blur-lg backdrop-filter dark:bg-gray-950/50">
          <div className="absolute left-0 h-full divide-y divide-gray-200 overflow-y-scroll border-l border-gray-200 bg-white p-4 dark:divide-gray-800 dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between pb-2">
              <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Documentation</h2>
              <button
                type="button"
                aria-label="Close docs navigation"
                onClick={() => setOpen(!open)}
                className="flex h-8 w-8 items-center justify-end text-slate-600 dark:text-slate-300"
              >
                <span className="inline-block w-4">
                  <CloseIcon />
                </span>
              </button>
            </div>
            <div className="pt-4">
              <DocsNavigation tree={tree} activePath={""} />
            </div>
          </div>
        </div>
      )}
      <div
        className={`fixed top-16 z-10 hidden h-16 w-full border-b border-gray-200 bg-white bg-opacity-90 backdrop-blur backdrop-filter transition-opacity duration-200 dark:border-gray-800 dark:bg-gray-950 lg:block ${top ? "opacity-0" : "opacity-100"}`}
      >
        <ul className="flex h-full items-center space-x-2 px-16 text-sm">
          {breadcrumbs.map(({ path, title }, index) => (
            <Fragment key={index}>
              {index < breadcrumbs.length - 1 && (
                <li className="flex items-center space-x-2">
                  <Link href={path} className="inline whitespace-nowrap hover:text-slate-600 dark:hover:text-slate-300">
                    {title}
                  </Link>
                  <span className="inline-block w-1.5 text-slate-400 dark:text-slate-500">
                    <RightArrow />
                  </span>
                </li>
              )}
            </Fragment>
          ))}
          <li className="hidden text-slate-800 dark:text-slate-200 lg:block">{title}</li>
        </ul>
      </div>
    </>
  );
}

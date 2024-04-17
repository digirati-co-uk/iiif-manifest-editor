"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import cx from "classnames";

export function GlobalNav() {
  const pathname = usePathname();

  return (
    <ul className="flex gap-4">
      <li>
        <Link
          href="/docs"
          className={cx(
            "bg-white hover:bg-pink-100 text-sm text-slate-900 py-2 px-4 rounded",
            pathname === "/docs" ? "bg-slate-100" : ""
          )}
        >
          Docs
        </Link>
      </li>
      <li>
        <a
          href="https://github.com/digirati-co-uk/iiif-manifest-editor"
          target="_blank"
          className="bg-white hover:bg-pink-100 text-sm text-slate-900 py-2 px-4 rounded"
        >
          Github
        </a>
      </li>
    </ul>
  );
}

"use client";

import Link from "next/link";
import { useTranslations } from "@manifest-editor/i18n";
export default function ExamplesListingPage() {
  const webT = useTranslations("web");

  return (
    <div>
      <li>
        <Link href="/examples/iiif-manifest-example">iiif-manifest-example</Link>
      </li>
      {webT("examples.all")}
    </div>
  );
}

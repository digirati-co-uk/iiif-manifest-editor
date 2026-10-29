"use client";

import { useTranslations } from "@manifest-editor/i18n";
import dynamic from "next/dynamic";
import { use } from "react";
import allExamples from "../../../../../../../examples.json";

const { examples } = allExamples;

const ExampleEditor = dynamic(() => import("../../../../components/example-editor/ExampleEditor"), {
  ssr: false,
});

export default function ExamplePage(props: { params: Promise<{ example: string }> }) {
  const webT = useTranslations("web");

  const params = use(props.params);
  const example = examples.find((e) => e.id === params.example);

  if (!example) {
    return <div>{webT("examples.notFound")}</div>;
  }

  const nextId = examples[examples.indexOf(example) + 1]?.id;

  return <ExampleEditor manifest={example.url} example={example} nextId={nextId} />;
}

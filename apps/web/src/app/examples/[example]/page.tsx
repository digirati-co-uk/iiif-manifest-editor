import dynamic from "next/dynamic";

const ExampleEditor = dynamic(() => import("../../../components/example-editor/ExampleEditor"), {
  ssr: false,
});

export default function ExamplePage({ params }: { params: { example: string } }) {
  return <ExampleEditor manifest="https://digirati-co-uk.github.io/wunder.json" />;
}

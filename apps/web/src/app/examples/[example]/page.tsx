import dynamic from "next/dynamic";
import allExamples from "../../../../../../examples.json";

const { examples } = allExamples;

const ExampleEditor = dynamic(() => import("../../../components/example-editor/ExampleEditor"), {
  ssr: false,
});

export default function ExamplePage({ params }: { params: { example: string } }) {
  const example = examples.find((e) => e.id === params.example);

  if (!example) {
    return <div>Example not found</div>;
  }

  const nextId = examples[examples.indexOf(example) + 1]?.id;

  return <ExampleEditor manifest={example.url} example={example} nextId={nextId} />;
}

import allExamples from "../../../../../../examples.json";
import { Launcher } from "../../../components/site/Launcher";

export default async function Page({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const defaultTab = (await searchParams).tab || "recent";
  return <Launcher defaultTab={defaultTab} examples={allExamples.examples} />;
}

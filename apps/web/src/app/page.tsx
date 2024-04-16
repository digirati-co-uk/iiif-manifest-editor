import { allDocumentations } from "contentlayer/generated";
import Link from "next/link";
export default function Page(): JSX.Element {
  return (
    <div className="bg-white p-28">
      <h1 className="text-3xl mb-5">Manifest Editor</h1>

      <Link
        // Button
        className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded"
        href="/legacy"
      >
        Go to editor
      </Link>
    </div>
  );
}

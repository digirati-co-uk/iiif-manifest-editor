import Link from "next/link";

export function ExampleListing({
  examples,
}: {
  examples: Array<{ id: string; label: string; description: string; url: string; thumbnail?: string }>;
}) {
  return (
    <div className="grid grid-md gap-4">
      {examples.map((example) => (
        <div className="relative" key={example.id}>
          <Link href={`/examples/${example.id}`}>
            <div className="border flex flex-col rounded hover:border-me-primary-500 overflow-hidden">
              <div className="bg-gray-200 w-full h-48 transition-transform">
                {example.thumbnail ? (
                  <img src={example.thumbnail} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/40">No thumbnail</div>
                )}
              </div>
              <span className="underline p-3  text-sm text-center w-full h-20 flex items-center justify-center overflow-hidden text-ellipsis">
                {example.label}
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

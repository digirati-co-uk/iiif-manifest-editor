"use client";

export function GlobalNav() {
  return (
    <ul className="flex gap-[clamp(0.25rem,1.25vw,1rem)]">
      <li>
        <a
          href="https://github.com/digirati-co-uk/iiif-manifest-editor"
          target="_blank"
          className="bg-white hover:bg-pink-100 text-sm text-slate-900 py-2 px-[clamp(0.25rem,1.25vw,1rem)] rounded"
        >
          Github
        </a>
      </li>
      <li>
        <a
          href="https://manifest-editor-docs.netlify.app"
          target="_blank"
          className="bg-white hover:bg-pink-100 text-sm text-slate-900 py-2 px-[clamp(0.25rem,1.25vw,1rem)] rounded"
        >
          Documentation
        </a>
      </li>
    </ul>
  );
}

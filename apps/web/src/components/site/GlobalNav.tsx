"use client";

export function GlobalNav() {
  return (
    <ul className="flex gap-4">
      <li>
        <a
          href="https://manifest-editor-docs.netlify.app"
          target="_blank"
          className="bg-white hover:bg-pink-100 text-sm text-slate-900 py-2 px-4 rounded"
        >
          Documentation
        </a>
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

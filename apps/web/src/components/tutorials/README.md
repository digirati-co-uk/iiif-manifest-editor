# Notebook tutorials

Register an entry in `tutorials.ts` with an ID, title, description, duration, optional thumbnail, source attribution, and Markdown. `TutorialListing` creates a blank project on first start and opens its notebook sidebar. Projects carry `extraData.tutorial` metadata with the tutorial ID, title, and source. The Tutorials tab uses this to show a Started checkmark and continue the latest saved attempt. Recent excludes these projects.

The reusable `createNotebookProject()` function in `browser-state.ts` creates an empty manifest and stores a Markdown note seed in the project's configuration. It also accepts an initial manifest label, stable note ID, source record, and extra project data. The tutorial catalog is one consumer; workshop launchers can call the same function with their own Markdown.

Instructions, image URLs, and resource links belong in the Markdown. Keep ordinary reference links on the tutorial card for now: the IIIF Browser currently tries to resolve notebook links as resources. The notebook parser supports headings, checklists, links, and embedded images. The original seed is stored with the project; subsequent notebook edits and completed checklist items are saved locally by the notebook. The generic function always creates a separate project and notebook; the tutorial listing reuses the saved project when continuing.

The first tutorial adapts the IIIF Cookbook's single-image recipe:
https://iiif.io/api/cookbook/recipe/0001-mvm-image/

Its result is a new manifest with one 1200 × 1800 canvas and a painting annotation for the recipe's PNG. The completed cookbook manifest is a reference, never preloaded into the learner's project.

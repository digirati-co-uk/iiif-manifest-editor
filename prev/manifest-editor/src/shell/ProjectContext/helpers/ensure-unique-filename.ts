import { EditorProject } from "../ProjectContext.types";
import slugify from "slugify";

export function ensureUniqueFilename(project: EditorProject, existing: EditorProject[]) {
  const filenames = existing.map((project) => project.filename);

  const name = (project.name || project.filename || "Untitled project").toLowerCase();

  if (project.filename && filenames.indexOf(project.filename) !== -1) {
    // duplicate.
    project.filename = undefined;
  }

  if (!project.filename) {
    let counter = 0;
    while (!project.filename) {
      // Create filename.
      const potentialFilename = `${slugify(name, { lower: true })}${counter ? ` (${counter})` : ""}`;
      if (filenames.indexOf(potentialFilename) === -1) {
        project.filename = potentialFilename;
        project.name = `${project.name} (${counter})`;
        break;
      }

      counter++;
    }
  }

  console.log({ project, filenames });
}

# D4 Exhibition terminology pass

## Why deferred

“Slide,” “canvas,” and “section” describe overlapping but not identical concepts across full-page, slideshow, scroll, IIIF JSON, and creator flows. A mechanical replacement would make at least one format less accurate and could change technical/debugging language that should remain “Canvas.” This needs a small product copy decision before implementation.

## Proposed copy model for review

| Context                                             | Suggested user-facing term                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------- |
| Full-page and slideshow authoring                   | Slide                                                                  |
| Scroll narrative authoring                          | Section                                                                |
| Generic exhibition action spanning formats          | Content or item, only where a format-specific label cannot be supplied |
| IIIF metadata, import errors, developer/debug views | Canvas                                                                 |
| Initial format choice                               | Exhibition format                                                      |

This is a starting point, not an approved glossary.

## Human review questions

1. Should scroll-tour annotations be “steps,” “stops,” or retain their current wording?
2. Should add actions be format-specific (“Add slide”/“Add section”) or consistently “Add content”?
3. Is “slide” acceptable in grid/full-page formats, or should those use “page”?
4. Which technical errors must retain “Canvas” for support and IIIF literacy?
5. Are any strings consumed by documentation, analytics, or tests outside this repository?

## Audit plan

1. Use `rg` to inventory visible strings, aria labels, empty states, tooltips, onboarding copy, tests, and documentation.
2. Classify each occurrence by format and audience; do not include source identifiers or IIIF type names in the copy replacement list.
3. Approve a short glossary and an exceptions list with product/design.
4. Create parallel implementation tasks by non-overlapping UI area: onboarding/preview, left and centre panels, right editors/creators, docs/tests.
5. End with a browser copy review in every format and an accessibility-name pass.

## Evidence needed to promote

- Approved glossary and per-format exceptions.
- Inventory of user-visible occurrences.
- Decision on format-specific versus generic add/delete actions.

## Future acceptance criteria

- Every user-facing term follows the approved glossary for its format.
- Technical IIIF language remains precise where users need it.
- Visible strings, aria labels, and empty-state actions agree.
- No manifest data, source identifier, or API type is renamed.

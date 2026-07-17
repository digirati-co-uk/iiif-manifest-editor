# Deferred issues

These are not discarded. Each file is a bounded discovery package with the evidence or decision required to promote it into a future implementation phase.

| Item                                                                           | Why deferred                                                               | Promotion gate                                          |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------------- |
| [D.1 Intermittent IIIF Browser selection](./D1-browser-select-availability.md) | Network-sensitive and not reliably reproduced                              | Repeatable trace or confirmed upstream fix              |
| [D.2 Edit existing crop modal](./D2-edit-image-crop.md)                        | Cross-resource save semantics and modal interaction need a reviewed design | Approved target/body mutation contract and UX           |
| [D.3 MDX editor integration](./D3-iiif-browser-mdx-plugin.md)                  | Repository has HTML/Tiptap surfaces but no identified MDX data field       | Decide the persisted MDX field and first editor surface |
| [D.4 Terminology decision](./D4-exhibition-terminology.md)                     | “Slide”, “canvas”, and “section” depend on format and audience             | Approve a product copy matrix                           |

Do not quietly fold these into another task. A developer may perform the read-only discovery described in a deferred file, but implementation should be scheduled only after its promotion gate is met.

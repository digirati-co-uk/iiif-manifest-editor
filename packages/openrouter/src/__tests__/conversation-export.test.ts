import { describe, expect, it } from "vitest";
import { formatConversationForClipboard } from "../conversation-export";

describe("conversation export", () => {
  it("formats assistant text and tool results into a readable transcript", () => {
    const output = formatConversationForClipboard({
      title: "Metadata test",
      messages: [
        {
          id: "msg-1",
          role: "user",
          parts: [{ type: "text", text: "Add 2 metadata entries." }],
        } as any,
        {
          id: "msg-2",
          role: "assistant",
          parts: [
            { type: "text", text: "Updated metadata on Manifest https://example.org/manifest" },
            {
              type: "tool-me_update_metadata",
              state: "output-available",
              input: {
                resource: {
                  id: "https://example.org/manifest",
                  type: "Manifest",
                },
                patches: [
                  {
                    type: "add",
                    label: "Test field 1",
                    value: "Sample value 1",
                  },
                ],
              },
              output: {
                ok: true,
                summary: "Updated metadata on Manifest https://example.org/manifest",
                changedRefs: [{ id: "https://example.org/manifest", type: "Manifest" }],
                createdRefs: [],
                warnings: [],
                data: {
                  metadataCount: 1,
                },
              },
            },
          ],
        } as any,
      ],
    });

    expect(output).toContain("Metadata test");
    expect(output).toContain("User");
    expect(output).toContain("Assistant");
    expect(output).toContain("Tool: Update Metadata");
    expect(output).toContain('"patches"');
    expect(output).toContain('"metadataCount": 1');
  });
});

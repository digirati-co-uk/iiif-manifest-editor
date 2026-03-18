// @vitest-environment jsdom

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ToolResultRenderer } from "../components/ToolResultRenderer";

describe("tool result renderer", () => {
  it("renders present_options inline and sends the selected label", () => {
    const onSelectOption = vi.fn();

    render(
      <ToolResultRenderer
        part={{
          type: "tool-present_options",
          toolCallId: "tool-call-1",
          state: "output-available",
          output: {
            prompt: "Which canvas should I edit?",
            options: [
              { label: "Current canvas" },
              { label: "Create a new canvas" },
            ],
          },
        }}
        onOpenRef={vi.fn()}
        onSelectOption={onSelectOption}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Current canvas" }));

    expect(onSelectOption).toHaveBeenCalledWith("tool-call-1", "Current canvas");
  });

  it("renders created and changed refs as clickable actions", () => {
    const onOpenRef = vi.fn();

    render(
      <ToolResultRenderer
        part={{
          type: "tool-me_update_resource_properties",
          toolCallId: "tool-call-1",
          state: "output-available",
          output: {
            ok: true,
            summary: "Updated the current manifest.",
            warnings: [],
            createdRefs: [{ id: "https://example.org/canvas/new", type: "Canvas" }],
            changedRefs: [{ id: "https://example.org/manifest", type: "Manifest" }],
            data: {
              property: "label",
            },
          },
        }}
        onOpenRef={onOpenRef}
        onSelectOption={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Manifest" }));
    fireEvent.click(screen.getByRole("button", { name: "Canvas" }));

    expect(onOpenRef).toHaveBeenNthCalledWith(1, {
      id: "https://example.org/manifest",
      type: "Manifest",
    });
    expect(onOpenRef).toHaveBeenNthCalledWith(2, {
      id: "https://example.org/canvas/new",
      type: "Canvas",
    });
  });

  it("renders failed tool results with structured details", () => {
    render(
      <ToolResultRenderer
        part={{
          type: "tool-me_update_metadata",
          toolCallId: "tool-call-2",
          state: "output-available",
          output: {
            ok: false,
            summary: "Invalid input for me_update_metadata: $.patches array must contain at least 1 item(s)",
            warnings: [],
            changedRefs: [],
            createdRefs: [],
            error: {
              code: "INVALID_INPUT",
              message: "Invalid input for me_update_metadata: $.patches array must contain at least 1 item(s)",
              details: {
                issues: [
                  {
                    path: "$.patches",
                    message: "Array must contain at least 1 item(s)",
                  },
                ],
              },
            },
          },
        }}
        onOpenRef={vi.fn()}
        onSelectOption={vi.fn()}
      />,
    );

    expect(screen.getByText("Failed")).toBeTruthy();
    expect(screen.getByText(/Invalid input for me_update_metadata/)).toBeTruthy();
    expect(screen.getByText("Details")).toBeTruthy();
  });
});

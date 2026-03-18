// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OpenRouterAssistantDock } from "../open-router-floating-panel";
import { getOrCreateOpenRouterStore } from "../store";

vi.mock("@manifest-editor/shell", () => ({
  useAppResourceInstance: () => "floating-assistant-test",
  useConfig: () => ({
    editorFeatureFlags: {
      openRouterAssistant: true,
    },
  }),
  useLayoutActions: () => ({
    edit: vi.fn(),
  }),
  useMatchMedia: () => [false],
}));

vi.mock("../use-openrouter-models", () => ({
  useOpenRouterModels: () => ({
    models: [{ id: "openrouter/auto", name: "Auto" }],
  }),
}));

vi.mock("../use-manifest-editor-ai-context", () => ({
  useManifestEditorAiContext: () => ({
    currentSelection: null,
  }),
}));

describe("floating assistant dock", () => {
  beforeEach(() => {
    const store = getOrCreateOpenRouterStore("floating-assistant-test");
    window.localStorage.clear();
    store.setState({
      ...store.getState(),
      apiKey: "test-openrouter-key",
      loggedIn: true,
      authInProgress: false,
      error: null,
      selectedModelId: "openrouter/auto",
      threads: [
        {
          id: "thread-1",
          title: "Chat 1",
          messages: [],
          messageMetadata: {},
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      ],
      currentThreadId: "thread-1",
      chatMessages: [],
      messageMetadata: {},
      optionSelections: {},
      threadsLoading: false,
      hydrated: true,
      panelView: "chat",
      chatStatus: "ready",
      chatError: null,
      controllerChatId: null,
      launcherOpen: false,
    });
  });

  it("keeps the prompt draft when the launcher is toggled", async () => {
    const user = userEvent.setup();

    render(<OpenRouterAssistantDock />);

    await user.click(screen.getByRole("button", { name: "AI assistant" }));

    const prompt = screen.getByPlaceholderText("Ask the assistant…");
    await user.type(prompt, "Keep this draft");

    await user.click(screen.getByRole("button", { name: "AI assistant" }));
    await user.click(screen.getByRole("button", { name: "AI assistant" }));

    expect((screen.getByPlaceholderText("Ask the assistant…") as HTMLTextAreaElement).value).toBe("Keep this draft");
  });
});

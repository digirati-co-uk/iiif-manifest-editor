// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildOpenRouterCallbackUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  handleOpenRouterCallback,
  logoutOpenRouter,
} from "../auth";
import { OPENROUTER_POST_MESSAGE, OPENROUTER_STORAGE_KEYS } from "../constants";

describe("openrouter auth helpers", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("builds a callback URL from the current page without the hash", () => {
    expect(buildOpenRouterCallbackUrl("https://example.com/editor/123?foo=bar#section")).toBe("https://example.com/openrouter/callback");
  });

  it("generates URL-safe PKCE values", async () => {
    const verifier = await generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);

    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(challenge.length).toBeGreaterThan(20);
  });

  it("exchanges the callback code, stores the API key, and notifies the opener", async () => {
    window.localStorage.setItem(OPENROUTER_STORAGE_KEYS.oauthState, "expected-state");
    window.localStorage.setItem(OPENROUTER_STORAGE_KEYS.pkceVerifier, "verifier-value");

    const history = {
      replaceState: vi.fn(),
    };
    const opener = {
      postMessage: vi.fn(),
    };
    const closeWindow = vi.fn();

    const result = await handleOpenRouterCallback({
      currentUrl: "https://example.com/openrouter/callback?code=abc&state=expected-state",
      storage: window.localStorage,
      fetchImpl: vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ key: "or-key" }),
      }) as any,
      history,
      opener,
      closeWindow,
    });

    expect(result).toEqual({
      handled: true,
      apiKey: "or-key",
    });
    expect(window.localStorage.getItem(OPENROUTER_STORAGE_KEYS.apiKey)).toBe("or-key");
    expect(window.localStorage.getItem(OPENROUTER_STORAGE_KEYS.oauthState)).toBeNull();
    expect(window.localStorage.getItem(OPENROUTER_STORAGE_KEYS.pkceVerifier)).toBeNull();
    expect(history.replaceState).toHaveBeenCalledWith(
      {},
      "",
      "https://example.com/openrouter/callback",
    );
    expect(opener.postMessage).toHaveBeenCalledWith(
      { type: OPENROUTER_POST_MESSAGE.success, apiKey: "or-key" },
      "https://example.com",
    );
    expect(closeWindow).not.toHaveBeenCalled();
  });

  it("rejects callback state mismatches", async () => {
    window.localStorage.setItem(OPENROUTER_STORAGE_KEYS.oauthState, "expected-state");
    window.localStorage.setItem(OPENROUTER_STORAGE_KEYS.pkceVerifier, "verifier-value");
    const opener = {
      postMessage: vi.fn(),
    };

    const result = await handleOpenRouterCallback({
      currentUrl: "https://example.com/openrouter/callback?code=abc&state=wrong-state",
      storage: window.localStorage,
      opener,
    });

    expect(result).toEqual({
      handled: true,
      error: "State validation failed. Please try logging in again.",
    });
    expect(opener.postMessage).toHaveBeenCalledWith(
      {
        type: OPENROUTER_POST_MESSAGE.error,
        error: "State validation failed. Please try logging in again.",
      },
      "https://example.com",
    );
  });

  it("clears auth credentials on logout", () => {
    window.localStorage.setItem(OPENROUTER_STORAGE_KEYS.apiKey, "or-key");
    window.localStorage.setItem(OPENROUTER_STORAGE_KEYS.oauthState, "expected-state");
    window.localStorage.setItem(OPENROUTER_STORAGE_KEYS.pkceVerifier, "verifier-value");

    logoutOpenRouter(window.localStorage);

    expect(window.localStorage.getItem(OPENROUTER_STORAGE_KEYS.apiKey)).toBeNull();
    expect(window.localStorage.getItem(OPENROUTER_STORAGE_KEYS.oauthState)).toBeNull();
    expect(window.localStorage.getItem(OPENROUTER_STORAGE_KEYS.pkceVerifier)).toBeNull();
  });
});

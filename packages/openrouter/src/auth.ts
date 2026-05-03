import {
  OPENROUTER_AUTH_KEYS_URL,
  OPENROUTER_AUTH_URL,
  OPENROUTER_CALLBACK_PATH,
  OPENROUTER_CALLBACK_QUERY,
  OPENROUTER_POPUP_HEIGHT,
  OPENROUTER_POPUP_NAME,
  OPENROUTER_POPUP_WIDTH,
  OPENROUTER_POST_MESSAGE,
  OPENROUTER_STORAGE_KEYS,
} from "./constants";

function base64UrlEncode(buffer: ArrayBuffer | Uint8Array) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function generateCodeVerifier() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export async function generateCodeChallenge(verifier: string) {
  const encoder = new TextEncoder();
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(verifier));
  return base64UrlEncode(digest);
}

export function createOAuthState() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

export function buildOpenRouterCallbackUrl(currentUrl: string = window.location.href) {
  const callbackUrl = new URL(OPENROUTER_CALLBACK_PATH, currentUrl);
  callbackUrl.hash = "";
  callbackUrl.search = "";
  return callbackUrl.toString();
}

export function buildOpenRouterAuthUrl(options: {
  callbackUrl: string;
  codeChallenge: string;
  state: string;
}) {
  const authUrl = new URL(OPENROUTER_AUTH_URL);
  authUrl.searchParams.set("callback_url", options.callbackUrl);
  authUrl.searchParams.set("code_challenge", options.codeChallenge);
  authUrl.searchParams.set("code_challenge_method", "S256");
  authUrl.searchParams.set("state", options.state);
  return authUrl.toString();
}

export function openCenteredPopup(
  url: string,
  options: {
    wnd?: Window;
    name?: string;
    width?: number;
    height?: number;
  } = {},
) {
  const wnd = options.wnd || window;
  const width = options.width || OPENROUTER_POPUP_WIDTH;
  const height = options.height || OPENROUTER_POPUP_HEIGHT;
  const left = wnd.screenX + Math.max((wnd.outerWidth - width) / 2, 0);
  const top = wnd.screenY + Math.max((wnd.outerHeight - height) / 2, 0);

  return wnd.open(
    url,
    options.name || OPENROUTER_POPUP_NAME,
    `width=${width},height=${height},left=${left},top=${top},popup=yes`,
  );
}

export async function exchangeOpenRouterCode(options: {
  code: string;
  verifier: string;
  fetchImpl?: typeof fetch;
}) {
  const fetchImpl = options.fetchImpl || fetch;
  const response = await fetchImpl(OPENROUTER_AUTH_KEYS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: options.code,
      code_verifier: options.verifier,
      code_challenge_method: "S256",
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || `Failed to exchange code: ${response.status}`);
  }

  const data = await response.json();
  if (!data?.key || typeof data.key !== "string") {
    throw new Error("No API key received from OpenRouter");
  }

  return data.key;
}

export function clearOpenRouterAuthStorage(storage: Storage) {
  storage.removeItem(OPENROUTER_STORAGE_KEYS.pkceVerifier);
  storage.removeItem(OPENROUTER_STORAGE_KEYS.oauthState);
}

export function logoutOpenRouter(storage: Storage) {
  storage.removeItem(OPENROUTER_STORAGE_KEYS.apiKey);
  clearOpenRouterAuthStorage(storage);
}

export function isOpenRouterCallbackUrl(currentUrl: string = window.location.href) {
  const url = new URL(currentUrl);
  const callbackPath = new URL(OPENROUTER_CALLBACK_PATH, url.origin).pathname;
  return (url.pathname === callbackPath || url.searchParams.get(OPENROUTER_CALLBACK_QUERY) === "1") && url.searchParams.has("code");
}

function postToOpener(
  opener: Pick<Window, "postMessage"> | null | undefined,
  message: { type: string; apiKey?: string; error?: string },
  targetOrigin: string,
) {
  opener?.postMessage(message, targetOrigin);
}

export async function handleOpenRouterCallback(options: {
  currentUrl?: string;
  storage?: Storage;
  fetchImpl?: typeof fetch;
  history?: Pick<History, "replaceState">;
  opener?: Pick<Window, "postMessage"> | null;
  origin?: string;
  closeWindow?: () => void;
  autoClose?: boolean;
}) {
  const currentUrl = options.currentUrl || window.location.href;
  const url = new URL(currentUrl);
  const opener = options.opener ?? window.opener;
  const callbackPath = new URL(OPENROUTER_CALLBACK_PATH, url.origin).pathname;
  const isDedicatedCallbackPath = url.pathname === callbackPath;
  const isLegacyCallback = url.searchParams.get(OPENROUTER_CALLBACK_QUERY) === "1";

  if ((!isDedicatedCallbackPath && !isLegacyCallback) || !url.searchParams.has("code")) {
    return { handled: false } as const;
  }

  const storage = options.storage || window.localStorage;
  const expectedState = storage.getItem(OPENROUTER_STORAGE_KEYS.oauthState);
  const returnedState = url.searchParams.get("state");
  const origin = options.origin || url.origin;
  const autoClose = options.autoClose ?? false;

  if (!expectedState || !returnedState || returnedState !== expectedState) {
    clearOpenRouterAuthStorage(storage);
    const error = "State validation failed. Please try logging in again.";
    postToOpener(opener, { type: OPENROUTER_POST_MESSAGE.error, error }, origin);
    if (opener && autoClose) {
      options.closeWindow?.();
    }
    return { handled: true, error } as const;
  }

  const codeVerifier = storage.getItem(OPENROUTER_STORAGE_KEYS.pkceVerifier);
  if (!codeVerifier) {
    const error = "Missing code verifier. Please try logging in again.";
    clearOpenRouterAuthStorage(storage);
    postToOpener(opener, { type: OPENROUTER_POST_MESSAGE.error, error }, origin);
    if (opener && autoClose) {
      options.closeWindow?.();
    }
    return { handled: true, error } as const;
  }

  try {
    const apiKey = await exchangeOpenRouterCode({
      code: url.searchParams.get("code")!,
      verifier: codeVerifier,
      fetchImpl: options.fetchImpl,
    });

    storage.setItem(OPENROUTER_STORAGE_KEYS.apiKey, apiKey);
    clearOpenRouterAuthStorage(storage);

    const cleanUrl = new URL(currentUrl);
    cleanUrl.searchParams.delete("code");
    cleanUrl.searchParams.delete("state");
    cleanUrl.searchParams.delete(OPENROUTER_CALLBACK_QUERY);
    options.history?.replaceState({}, "", cleanUrl.toString());

    postToOpener(opener, { type: OPENROUTER_POST_MESSAGE.success, apiKey }, origin);
    if (opener && autoClose) {
      options.closeWindow?.();
    }

    return { handled: true, apiKey } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    postToOpener(opener, { type: OPENROUTER_POST_MESSAGE.error, error: message }, origin);
    if (opener && autoClose) {
      options.closeWindow?.();
    }
    return { handled: true, error: message } as const;
  }
}

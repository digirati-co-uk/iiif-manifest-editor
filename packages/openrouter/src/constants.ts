export const OPENROUTER_PANEL_ID = "left-panel-openrouter";
export const OPENROUTER_BACKGROUND_ID = "openrouter-background-task";
export const OPENROUTER_FLOATING_PANEL_ID = "openrouter-floating-panel";
export const OPENROUTER_DEFAULT_MODEL_ID = "openrouter/auto";
export const OPENROUTER_THREAD_STORAGE_NAME = "manifest-editor-openrouter-threads";
export const OPENROUTER_THREAD_STORAGE_STORE = "threads";
export const OPENROUTER_AUTH_URL = "https://openrouter.ai/auth";
export const OPENROUTER_AUTH_KEYS_URL = "https://openrouter.ai/api/v1/auth/keys";
export const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
export const OPENROUTER_CALLBACK_QUERY = "openrouter-callback";
export const OPENROUTER_CALLBACK_PATH = "/openrouter/callback";
export const OPENROUTER_POPUP_NAME = "manifest-editor-openrouter-auth";
export const OPENROUTER_POPUP_WIDTH = 600;
export const OPENROUTER_POPUP_HEIGHT = 700;

export const OPENROUTER_STORAGE_KEYS = {
  apiKey: "manifest-editor.openrouter.apiKey",
  selectedModelId: "manifest-editor.openrouter.model",
  pkceVerifier: "manifest-editor.openrouter.pkceVerifier",
  oauthState: "manifest-editor.openrouter.oauthState",
} as const;

export const OPENROUTER_POST_MESSAGE = {
  success: "manifest-editor.openrouter.auth-success",
  error: "manifest-editor.openrouter.auth-error",
} as const;

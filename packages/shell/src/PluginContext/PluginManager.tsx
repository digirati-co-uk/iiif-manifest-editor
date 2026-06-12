import { CheckIcon, Modal } from "@manifest-editor/components";
import { useContext, useEffect, useMemo, useState } from "react";
import { useApp, useAppInstance } from "../AppContext/AppContext";
import { useConfig, useSaveConfig } from "../ConfigContext/ConfigContext";
import { useLayoutActions } from "../Layout/Layout.context";
import { PluginGlobalConfigReactContext, usePluginActions, usePluginConfigApi, usePlugins } from "./PluginContext";
import {
  disablePluginInConfig,
  enablePluginAndDependenciesInConfig,
  getEnabledPluginsForApp,
  getPluginCompatibilityReason,
  getPluginSelectionSource,
  isPluginCompatible,
  isPluginSelected,
  resetPluginInConfig,
} from "./PluginContext.helpers";
import type {
  MappedPlugin,
  PluginAppConfig,
  PluginConfigScope,
  PluginSettingsField,
  PluginSettingsValue,
} from "./PluginContext.types";

function getImage(image: MappedPlugin["metadata"]["image"]) {
  if (!image) return null;
  return typeof image === "string" ? { src: image, alt: "" } : image;
}

function getAuthor(author: MappedPlugin["metadata"]["author"]) {
  if (!author) return null;
  return typeof author === "string" ? author : author.name;
}

function getPluginEntryPoint(plugin: MappedPlugin) {
  const extension = plugin.extension;
  const panel =
    extension.leftPanels?.[0] ||
    extension.centerPanels?.[0] ||
    extension.rightPanels?.[0] ||
    extension.modalPanels?.[0];

  if (!panel) return null;

  return {
    id: panel.id,
    label: panel.label || "Open plugin",
    modal: extension.modalPanels?.some((item) => item.id === panel.id) || false,
  };
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Plugin configuration could not be saved.";
}

function ConfigureIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function OpenArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function PluginManager() {
  const app = useApp();
  const { appId } = useAppInstance();
  const config = useConfig();
  const saveConfig = useSaveConfig();
  const pluginState = usePlugins();
  const actions = usePluginActions();
  const layoutActions = useLayoutActions();
  const { saveGlobalPluginConfig } = useContext(PluginGlobalConfigReactContext);
  const [showAll, setShowAll] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedPluginId, setSelectedPluginId] = useState<string | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activePluginIds = useMemo(
    () => new Set(getEnabledPluginsForApp(pluginState, app, appId).map((plugin) => plugin.metadata.id)),
    [pluginState, app, appId],
  );

  const filteredPlugins = useMemo(() => {
    const normalisedQuery = query.trim().toLowerCase();

    return pluginState.plugins.filter((plugin) => {
      const compatible = isPluginCompatible(plugin, app, appId);
      if (!showAll && !compatible) return false;

      if (!normalisedQuery) return true;

      const haystack = [
        plugin.metadata.label,
        plugin.metadata.id,
        plugin.metadata.description,
        getAuthor(plugin.metadata.author),
        ...(plugin.metadata.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalisedQuery);
    });
  }, [app, appId, pluginState.plugins, query, showAll]);

  const selectedPlugin = selectedPluginId
    ? pluginState.plugins.find((plugin) => plugin.metadata.id === selectedPluginId) || null
    : null;

  if (!pluginState.plugins.length) {
    return null;
  }

  function persistWorkspaceAppConfig(nextAppConfig: PluginAppConfig) {
    actions.setAppConfig(appId, nextAppConfig);
    saveConfig({
      plugins: {
        ...(config.plugins || {}),
        apps: {
          ...(config.plugins?.apps || {}),
          [appId]: nextAppConfig,
        },
      },
    });
  }

  async function persistGlobalAppConfig(nextAppConfig: PluginAppConfig) {
    if (!saveGlobalPluginConfig) {
      setError("Global plugin settings are not available in this host.");
      return;
    }

    const previousAppConfig = pluginState.globalApps[appId] || {};
    const nextGlobalConfig = {
      apps: {
        ...pluginState.globalApps,
        [appId]: nextAppConfig,
      },
    };

    actions.setGlobalAppConfig(appId, nextAppConfig);

    try {
      await saveGlobalPluginConfig(nextGlobalConfig);
    } catch (error) {
      actions.setGlobalAppConfig(appId, previousAppConfig);
      setError(getErrorMessage(error));
    }
  }

  async function setPluginEnabled(plugin: MappedPlugin, enabled: boolean, scope: PluginConfigScope) {
    setError(null);
    setSavingKey(`${scope}:${plugin.metadata.id}`);

    const current = scope === "global" ? pluginState.globalApps[appId] || {} : pluginState.apps[appId] || {};
    const nextAppConfig = enabled
      ? enablePluginAndDependenciesInConfig(current, pluginState, plugin, app, appId)
      : { config: disablePluginInConfig(current, plugin.metadata.id), blocked: [] };

    if (nextAppConfig.blocked.length) {
      setSavingKey(null);
      setError(`Cannot enable ${plugin.metadata.label}: ${nextAppConfig.blocked.join(", ")}.`);
      return;
    }

    if (scope === "global") {
      await persistGlobalAppConfig(nextAppConfig.config);
    } else {
      persistWorkspaceAppConfig(nextAppConfig.config);
    }

    setSavingKey(null);
  }

  function openPlugin(plugin: MappedPlugin) {
    const entryPoint = getPluginEntryPoint(plugin);
    if (!entryPoint) return;

    if (entryPoint.modal) {
      layoutActions.modal.open({ id: entryPoint.id });
      return;
    }

    layoutActions.open(entryPoint.id);
  }

  return (
    <section className="flex flex-col gap-3 border-t border-gray-200 pt-4 mt-4">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm text-gray-900">Plugins</h3>
        </div>
        <button
          type="button"
          className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? "Compatible only" : "Show all"}
        </button>
      </div>

      <input
        className="rounded border border-gray-200 px-2.5 py-1.5 text-xs focus:border-me-primary-500 focus:ring-2 focus:ring-me-primary-500/20 focus:outline-none"
        type="search"
        placeholder="Search plugins…"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
      />

      {error ? (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>
      ) : null}

      <div className="flex flex-col gap-2">
        {filteredPlugins.map((plugin) => {
          const selected = isPluginSelected(plugin, pluginState, appId);
          const active = activePluginIds.has(plugin.metadata.id);
          const loading = selected && plugin.loadStatus === "loading";
          const loadError = selected && plugin.loadStatus === "error" ? plugin.loadError : null;
          const image = getImage(plugin.metadata.image);
          const blocked = selected && !active && !loading && !loadError;
          const compatible = isPluginCompatible(plugin, app, appId);
          const compatibilityReason = getPluginCompatibilityReason(plugin, app, appId);
          const entryPoint = getPluginEntryPoint(plugin);
          const canConfigure = !!plugin.settings;
          const isSaving = savingKey === `workspace:${plugin.metadata.id}`;

          return (
            <article
              key={plugin.metadata.id}
              className={`flex gap-2.5 rounded-lg border bg-white p-3 text-sm transition-colors ${
                active ? "border-gray-200" : "border-gray-100 opacity-60"
              } ${!compatible ? "opacity-40" : ""}`}
            >
              {image ? (
                <img
                  className="h-9 w-9 rounded object-cover flex-none mt-0.5"
                  src={image.src}
                  alt={image.alt || plugin.metadata.label}
                />
              ) : (
                <div
                  className={`h-9 w-9 rounded flex items-center justify-center flex-none mt-0.5 text-lg ${
                    active ? "bg-me-primary-50 text-me-primary-500" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <ConfigureIcon className="w-4 h-4" />
                </div>
              )}

              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-start justify-between gap-1">
                  <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                    <span className="font-medium text-gray-900 text-xs">{plugin.metadata.label}</span>
                    {plugin.metadata.official ? (
                      <span className="rounded-full text-me-primary-500 px-1.5 py-0 text-[9px] font-bold inline-flex items-center gap-1">
                        <CheckIcon className="w-3 h-3" /> Verified
                      </span>
                    ) : null}
                    {plugin.metadata.version ? (
                      <span className="text-[10px] text-gray-400">{plugin.metadata.version}</span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1 flex-none">
                    {canConfigure ? (
                      <button
                        type="button"
                        title="Configure plugin"
                        className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setSelectedPluginId(plugin.metadata.id)}
                      >
                        <ConfigureIcon className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                    {active && entryPoint ? (
                      <button
                        type="button"
                        title={`Open ${entryPoint.label}`}
                        className="rounded p-1 text-me-primary-500 hover:bg-me-primary-50 transition-colors"
                        onClick={() => openPlugin(plugin)}
                      >
                        <OpenArrowIcon className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                    <button
                      type="button"
                      disabled={!compatible || isSaving}
                      onClick={() => setPluginEnabled(plugin, !selected, "workspace")}
                      className={`relative inline-flex h-5 w-9 flex-none items-center rounded-full transition-colors disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-me-primary-500/30 ${
                        selected ? "bg-me-primary-500" : "bg-gray-200"
                      }`}
                      title={selected ? "Disable plugin" : "Enable plugin"}
                      aria-label={selected ? "Disable plugin" : "Enable plugin"}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                          selected ? "translate-x-4" : "translate-x-0.5"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {plugin.metadata.description ? (
                  <p className="text-xs text-gray-500 leading-relaxed">{plugin.metadata.description}</p>
                ) : null}

                {loading ? <span className="text-xs text-gray-500">Loading plugin…</span> : null}
                {loadError ? <span className="text-xs text-red-600">{loadError}</span> : null}
                {blocked ? <span className="text-xs text-amber-600">Waiting for required dependencies</span> : null}
                {!compatible && compatibilityReason ? (
                  <span className="text-xs text-gray-400">{compatibilityReason}</span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      {!filteredPlugins.length ? (
        <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-xs text-gray-500">
          No plugins found.
        </div>
      ) : null}

      {selectedPlugin ? (
        <Modal
          title={`Configure ${selectedPlugin.metadata.label}`}
          onClose={() => setSelectedPluginId(null)}
          width="560px"
        >
          <PluginSettingsEditor
            plugin={selectedPlugin}
            onClose={() => setSelectedPluginId(null)}
            canSaveGlobal={!!saveGlobalPluginConfig}
          />
        </Modal>
      ) : null}
    </section>
  );
}

function PluginSettingsEditor({
  plugin,
  onClose,
  canSaveGlobal,
}: {
  plugin: MappedPlugin;
  onClose: () => void;
  canSaveGlobal?: boolean;
}) {
  const api = usePluginConfigApi(plugin.metadata.id);
  const [scope, setScope] = useState<PluginConfigScope>("workspace");
  const [draft, setDraft] = useState<PluginSettingsValue>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceValue = scope === "global" ? api.global : api.workspace;

  useEffect(() => {
    setDraft({ ...sourceValue });
    setError(null);
    setSaved(false);
  }, [plugin.metadata.id, scope]);

  async function save() {
    const validation = plugin.settings?.validate?.(draft);
    if (validation) {
      setError(validation);
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (scope === "global") {
        await api.setGlobalSettings(draft);
      } else {
        api.setWorkspaceSettings(draft);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setSaving(true);
    setError(null);
    try {
      if (scope === "global") {
        await api.resetGlobalSettings();
      } else {
        api.resetWorkspaceSettings();
      }
      setDraft({});
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  const showGlobal = canSaveGlobal && api.canSaveGlobal;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {showGlobal ? (
        <div className="flex items-center gap-1 px-5 pt-4 pb-3 border-b border-gray-100">
          <span className="text-xs text-gray-500 mr-2">Scope:</span>
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              scope === "workspace" ? "bg-me-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setScope("workspace")}
          >
            This workspace
          </button>
          <button
            type="button"
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              scope === "global" ? "bg-me-primary-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            onClick={() => setScope("global")}
          >
            All workspaces
          </button>
        </div>
      ) : null}

      {error ? (
        <div className="mx-5 mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex flex-col gap-3">
          {plugin.settings?.render ? (
            plugin.settings.render({
              plugin,
              appId: api.appId,
              scope,
              value: draft,
              defaults: api.defaults,
              effective: api.effective,
              onChange: setDraft,
            })
          ) : plugin.settings?.fields?.length ? (
            plugin.settings.fields.map((field) => (
              <PluginSettingsFieldControl key={field.id} field={field} draft={draft} setDraft={setDraft} />
            ))
          ) : (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-center text-sm text-gray-500">
              This plugin has no configurable settings.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-5 py-4">
        <button
          type="button"
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
          disabled={saving}
          onClick={reset}
        >
          Reset to defaults
        </button>
        <div className="flex items-center gap-2">
          {saved ? <span className="text-xs text-green-600">✓ Saved</span> : null}
          <button
            type="button"
            className="rounded-lg bg-me-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-me-primary-600 disabled:opacity-50 transition-colors"
            disabled={saving}
            onClick={save}
          >
            {saving ? "Saving…" : `Save ${scope}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function PluginSettingsFieldControl({
  field,
  draft,
  setDraft,
}: {
  field: PluginSettingsField;
  draft: PluginSettingsValue;
  setDraft: (value: PluginSettingsValue) => void;
}) {
  const value = draft[field.id];
  const id = `plugin-setting-${field.id}`;

  function update(nextValue: unknown) {
    setDraft({
      ...draft,
      [field.id]: nextValue,
    });
  }

  const label = (
    <label className="text-sm font-medium text-gray-900" htmlFor={id}>
      {field.label}
    </label>
  );

  const inputClasses =
    "rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-me-primary-500 focus:ring-2 focus:ring-me-primary-500/20 focus:outline-none";

  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3">
        <div className="flex flex-col gap-0.5">
          {label}
          {field.description ? <span className="text-xs text-gray-500">{field.description}</span> : null}
        </div>
        <input
          id={id}
          type="checkbox"
          checked={value === true}
          onChange={(event) => update(event.currentTarget.checked)}
          className="h-4 w-4 rounded border-gray-300 text-me-primary-500 focus:ring-me-primary-500"
        />
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3">
        {label}
        {field.description ? <span className="text-xs text-gray-500">{field.description}</span> : null}
        <textarea
          id={id}
          className={`${inputClasses} min-h-24 resize-y`}
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          onChange={(event) => update(event.currentTarget.value)}
        />
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3">
        {label}
        {field.description ? <span className="text-xs text-gray-500">{field.description}</span> : null}
        <select
          id={id}
          className={inputClasses}
          value={typeof value === "undefined" ? "" : String(value)}
          onChange={(event) => {
            const option = field.options?.find((item) => String(item.value) === event.currentTarget.value);
            update(option ? option.value : event.currentTarget.value);
          }}
        >
          <option value="">Default</option>
          {(field.options || []).map((option) => (
            <option key={String(option.value)} value={String(option.value)}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3">
      {label}
      {field.description ? <span className="text-xs text-gray-500">{field.description}</span> : null}
      <input
        id={id}
        className={inputClasses}
        type={field.type === "number" ? "number" : "text"}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
        placeholder={field.placeholder}
        onChange={(event) => {
          update(field.type === "number" ? Number(event.currentTarget.value) : event.currentTarget.value);
        }}
      />
    </div>
  );
}

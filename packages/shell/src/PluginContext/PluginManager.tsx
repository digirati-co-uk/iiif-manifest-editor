import { useContext, useEffect, useMemo, useState } from "react";
import { useApp, useAppInstance } from "../AppContext/AppContext";
import { useConfig, useSaveConfig } from "../ConfigContext/ConfigContext";
import { useLayoutActions } from "../Layout/Layout.context";
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
import {
  PluginGlobalConfigReactContext,
  usePluginActions,
  usePluginConfigApi,
  usePlugins,
} from "./PluginContext";
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

  function resetWorkspacePlugin(plugin: MappedPlugin) {
    setError(null);
    persistWorkspaceAppConfig(resetPluginInConfig(pluginState.apps[appId] || {}, plugin.metadata.id));
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
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-sm">Plugins</h3>
          <p className="mt-1 text-xs text-gray-500">Browse available plugins for this editor.</p>
        </div>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? "Compatible" : "All plugins"}
        </button>
      </div>

      <input
        className="rounded border border-gray-300 px-3 py-2 text-sm"
        type="search"
        placeholder="Search plugins"
        value={query}
        onChange={(event) => setQuery(event.currentTarget.value)}
      />

      {error ? <div className="rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">{error}</div> : null}

      <div className="flex flex-col gap-3">
        {filteredPlugins.map((plugin) => {
          const selected = isPluginSelected(plugin, pluginState, appId);
          const active = activePluginIds.has(plugin.metadata.id);
          const image = getImage(plugin.metadata.image);
          const author = getAuthor(plugin.metadata.author);
          const blocked = selected && !active;
          const compatible = isPluginCompatible(plugin, app, appId);
          const compatibilityReason = getPluginCompatibilityReason(plugin, app, appId);
          const selectionSource = getPluginSelectionSource(plugin, pluginState, appId);
          const hasWorkspaceOverride = selectionSource === "workspace";
          const entryPoint = getPluginEntryPoint(plugin);
          const canConfigure = !!plugin.settings;

          return (
            <article key={plugin.metadata.id} className="flex gap-3 rounded border border-gray-200 bg-white p-3 text-sm">
              {image ? (
                <img className="h-14 w-14 rounded object-cover" src={image.src} alt={image.alt || plugin.metadata.label} />
              ) : null}
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{plugin.metadata.label}</span>
                  <span className={selected ? "text-xs text-green-700" : "text-xs text-gray-500"}>
                    {selected ? `Enabled (${selectionSource})` : "Disabled"}
                  </span>
                  {plugin.metadata.official ? (
                    <span className="rounded bg-me-primary-100 px-2 py-0.5 text-xs text-me-primary-700">Official</span>
                  ) : null}
                  {plugin.metadata.version ? <span className="text-xs text-gray-500">{plugin.metadata.version}</span> : null}
                </div>

                {plugin.metadata.description ? <p className="text-gray-600">{plugin.metadata.description}</p> : null}
                {author ? <span className="text-xs text-gray-500">By {author}</span> : null}

                {plugin.metadata.tags?.length ? (
                  <div className="flex flex-wrap gap-1">
                    {plugin.metadata.tags.map((tag) => (
                      <span key={tag} className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {!compatible && compatibilityReason ? <span className="text-xs text-gray-500">{compatibilityReason}</span> : null}
                {blocked ? <span className="text-xs text-red-600">Enabled but waiting for required dependencies.</span> : null}
                {plugin.metadata.dependencies?.length ? (
                  <span className="text-xs text-gray-500">Depends on {plugin.metadata.dependencies.join(", ")}</span>
                ) : null}
                {plugin.metadata.screenshots?.length ? (
                  <span className="text-xs text-gray-500">
                    {plugin.metadata.screenshots.length} screenshot
                    {plugin.metadata.screenshots.length === 1 ? "" : "s"}
                  </span>
                ) : null}

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 disabled:opacity-50"
                    disabled={!compatible || savingKey === `workspace:${plugin.metadata.id}`}
                    onClick={() => setPluginEnabled(plugin, !selected, "workspace")}
                  >
                    {selected ? "Disable workspace" : "Enable workspace"}
                  </button>
                  {saveGlobalPluginConfig ? (
                    <button
                      type="button"
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 disabled:opacity-50"
                      disabled={!compatible || savingKey === `global:${plugin.metadata.id}`}
                      onClick={() => setPluginEnabled(plugin, !selected, "global")}
                    >
                      {selected ? "Disable global" : "Enable global"}
                    </button>
                  ) : null}
                  {hasWorkspaceOverride ? (
                    <button
                      type="button"
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
                      onClick={() => resetWorkspacePlugin(plugin)}
                    >
                      Reset workspace
                    </button>
                  ) : null}
                  {canConfigure ? (
                    <button
                      type="button"
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700"
                      onClick={() => setSelectedPluginId(plugin.metadata.id)}
                    >
                      Configure
                    </button>
                  ) : null}
                  {active && entryPoint ? (
                    <button
                      type="button"
                      className="rounded border border-me-primary-500 bg-me-primary-500 px-2 py-1 text-xs text-white"
                      onClick={() => openPlugin(plugin)}
                    >
                      Open {entryPoint.label}
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {!filteredPlugins.length ? <div className="rounded border border-gray-200 bg-white p-3 text-sm text-gray-600">No plugins found.</div> : null}

      {selectedPlugin ? <PluginSettingsEditor plugin={selectedPlugin} onClose={() => setSelectedPluginId(null)} /> : null}
    </section>
  );
}

function PluginSettingsEditor({ plugin, onClose }: { plugin: MappedPlugin; onClose: () => void }) {
  const api = usePluginConfigApi(plugin.metadata.id);
  const [scope, setScope] = useState<PluginConfigScope>("workspace");
  const [draft, setDraft] = useState<PluginSettingsValue>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sourceValue = scope === "global" ? api.global : api.workspace;

  useEffect(() => {
    setDraft({ ...sourceValue });
    setError(null);
  }, [plugin.metadata.id, scope, sourceValue]);

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
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded border border-gray-200 bg-gray-50 p-3 text-sm">
      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 font-medium">Configure {plugin.metadata.label}</div>
        <button type="button" className="rounded border border-gray-300 bg-white px-2 py-1 text-xs" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className={`rounded border px-2 py-1 text-xs ${
            scope === "workspace" ? "border-me-primary-500 bg-me-primary-500 text-white" : "border-gray-300 bg-white text-gray-700"
          }`}
          onClick={() => setScope("workspace")}
        >
          Workspace
        </button>
        {api.canSaveGlobal ? (
          <button
            type="button"
            className={`rounded border px-2 py-1 text-xs ${
              scope === "global" ? "border-me-primary-500 bg-me-primary-500 text-white" : "border-gray-300 bg-white text-gray-700"
            }`}
            onClick={() => setScope("global")}
          >
            Global
          </button>
        ) : null}
      </div>

      {error ? <div className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-xs text-red-700">{error}</div> : null}

      <div className="mt-3 flex flex-col gap-3">
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
          <div className="rounded border border-gray-200 bg-white p-3 text-xs text-gray-600">This plugin has no configurable settings.</div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded border border-me-primary-500 bg-me-primary-500 px-3 py-2 text-xs text-white disabled:opacity-50"
          disabled={saving || (scope === "global" && !api.canSaveGlobal)}
          onClick={save}
        >
          Save {scope}
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 disabled:opacity-50"
          disabled={saving || (scope === "global" && !api.canSaveGlobal)}
          onClick={reset}
        >
          Reset {scope}
        </button>
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
    <label className="font-medium text-gray-900" htmlFor={id}>
      {field.label}
    </label>
  );

  if (field.type === "boolean") {
    return (
      <div className="flex items-start gap-2 rounded border border-gray-200 bg-white p-3">
        <input id={id} type="checkbox" checked={value === true} onChange={(event) => update(event.currentTarget.checked)} />
        <div className="flex flex-col gap-1">
          {label}
          {field.description ? <span className="text-xs text-gray-500">{field.description}</span> : null}
        </div>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className="flex flex-col gap-1 rounded border border-gray-200 bg-white p-3">
        {label}
        <textarea
          id={id}
          className="min-h-24 rounded border border-gray-300 p-2 text-sm"
          value={typeof value === "string" ? value : ""}
          placeholder={field.placeholder}
          onChange={(event) => update(event.currentTarget.value)}
        />
        {field.description ? <span className="text-xs text-gray-500">{field.description}</span> : null}
      </div>
    );
  }

  if (field.type === "select") {
    return (
      <div className="flex flex-col gap-1 rounded border border-gray-200 bg-white p-3">
        {label}
        <select
          id={id}
          className="rounded border border-gray-300 bg-white p-2 text-sm"
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
        {field.description ? <span className="text-xs text-gray-500">{field.description}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 rounded border border-gray-200 bg-white p-3">
      {label}
      <input
        id={id}
        className="rounded border border-gray-300 p-2 text-sm"
        type={field.type === "number" ? "number" : "text"}
        value={typeof value === "string" || typeof value === "number" ? value : ""}
        placeholder={field.placeholder}
        onChange={(event) => {
          update(field.type === "number" ? Number(event.currentTarget.value) : event.currentTarget.value);
        }}
      />
      {field.description ? <span className="text-xs text-gray-500">{field.description}</span> : null}
    </div>
  );
}

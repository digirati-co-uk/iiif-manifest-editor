import { useMemo } from "react";
import { useApp, useAppInstance } from "../AppContext/AppContext";
import { useConfig, useSaveConfig } from "../ConfigContext/ConfigContext";
import {
  disablePluginInConfig,
  enablePluginInConfig,
  getEnabledPluginsForApp,
  isPluginCompatible,
  isPluginSelected,
} from "./PluginContext.helpers";
import { usePluginActions, usePlugins } from "./PluginContext";
import type { MappedPlugin, PluginAppConfig } from "./PluginContext.types";

function getImage(image: MappedPlugin["metadata"]["image"]) {
  if (!image) return null;
  return typeof image === "string" ? { src: image, alt: "" } : image;
}

function getAuthor(author: MappedPlugin["metadata"]["author"]) {
  if (!author) return null;
  return typeof author === "string" ? author : author.name;
}

export function PluginManager() {
  const app = useApp();
  const { appId } = useAppInstance();
  const config = useConfig();
  const saveConfig = useSaveConfig();
  const pluginState = usePlugins();
  const actions = usePluginActions();

  const compatiblePlugins = useMemo(
    () => pluginState.plugins.filter((plugin) => isPluginCompatible(plugin, app, appId)),
    [pluginState.plugins, app, appId],
  );

  const activePluginIds = useMemo(
    () => new Set(getEnabledPluginsForApp(pluginState, app, appId).map((plugin) => plugin.metadata.id)),
    [pluginState, app, appId],
  );

  if (!compatiblePlugins.length) {
    return null;
  }

  function persistPluginConfig(nextAppConfig: PluginAppConfig) {
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

  function setPluginEnabled(plugin: MappedPlugin, enabled: boolean) {
    const current = pluginState.apps[appId] || {};
    const nextAppConfig = enabled
      ? enablePluginInConfig(current, plugin.metadata.id)
      : disablePluginInConfig(current, plugin.metadata.id);

    if (enabled) {
      actions.enable(appId, plugin.metadata.id);
    } else {
      actions.disable(appId, plugin.metadata.id);
    }
    persistPluginConfig(nextAppConfig);
  }

  return (
    <section className="flex flex-col gap-3 border-t border-gray-200 pt-4 mt-4">
      <div>
        <h3 className="font-semibold text-sm">Plugins</h3>
      </div>
      <div className="flex flex-col gap-3">
        {compatiblePlugins.map((plugin) => {
          const selected = isPluginSelected(plugin, pluginState, appId);
          const active = activePluginIds.has(plugin.metadata.id);
          const image = getImage(plugin.metadata.image);
          const author = getAuthor(plugin.metadata.author);
          const blocked = selected && !active;

          return (
            <label
              key={plugin.metadata.id}
              className="flex gap-3 rounded border border-gray-200 bg-white p-3 text-sm"
            >
              <input
                className="mt-1"
                type="checkbox"
                checked={selected}
                onChange={(e) => setPluginEnabled(plugin, e.currentTarget.checked)}
              />
              {image ? (
                <img
                  className="h-12 w-12 rounded object-cover"
                  src={image.src}
                  alt={image.alt || plugin.metadata.label}
                />
              ) : null}
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{plugin.metadata.label}</span>
                  {plugin.metadata.official ? (
                    <span className="rounded bg-me-primary-100 px-2 py-0.5 text-xs text-me-primary-700">
                      Official
                    </span>
                  ) : null}
                  {plugin.metadata.version ? (
                    <span className="text-xs text-gray-500">{plugin.metadata.version}</span>
                  ) : null}
                </span>
                {plugin.metadata.description ? (
                  <span className="text-gray-600">{plugin.metadata.description}</span>
                ) : null}
                {author ? <span className="text-xs text-gray-500">By {author}</span> : null}
                {blocked ? (
                  <span className="text-xs text-red-600">Plugin is enabled but waiting for required dependencies.</span>
                ) : null}
                {plugin.metadata.screenshots?.length ? (
                  <span className="text-xs text-gray-500">
                    {plugin.metadata.screenshots.length} screenshot
                    {plugin.metadata.screenshots.length === 1 ? "" : "s"}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}

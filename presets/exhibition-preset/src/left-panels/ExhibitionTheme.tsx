import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import {
  type LayoutPanel,
  type PresetTemplateConfigurationField,
  useOpenPresetOnboarding,
} from "@manifest-editor/shell";
import { DownIcon } from "@manifest-editor/ui/icons/DownIcon";
import { type ChangeEvent, type ReactNode, useMemo, useState } from "react";
import { Button } from "react-aria-components";
import { useManifest, useVault } from "react-iiif-vault";
import { useExhibitionPreviewPreset } from "../helpers/exhibition-preview-state";
import type { PresetUrlSearchParamsPreset } from "../helpers/exhibition-preview-url-helper";
import type {
  ExhibitionThemeConfig,
  ExhibitionThemePreset,
  FloatingPosition,
  TableOfContentsPlacement,
  TitleTransform,
} from "../theme/theme-service";
import {
  EXHIBITION_THEME_SERVICE_LABEL,
  EXHIBITION_THEME_SERVICE_PROFILE,
  createThemeService,
  getThemePreset,
  getThemeServiceDetails,
  replaceThemeService,
  resolveThemeConfig,
} from "../theme/theme-service";
import { useExhibitionTemplate } from "../helpers/exhibition-template";
import { PreviewIcon } from "../icons/PreviewIcon";
import { getTemplateConfigurationValue, setTemplateConfigurationValue } from "../exhibition-templates";

export const exhibitionThemeLeftPanel: LayoutPanel = {
  id: "@exhibitions/theme-panel",
  label: "Preview",
  icon: <PreviewIcon />,
  render: () => <ExhibitionPreviewPanel />,
  options: {
    minWidth: 360,
    maxWidth: 440,
  },
};

function ExhibitionPreviewPanel() {
  const manifest = useManifest();
  const vault = useVault();
  const template = useExhibitionTemplate();
  const openOnboarding = useOpenPresetOnboarding();
  const serviceList = ((manifest as any)?.service || []) as Array<any>;
  const servicesList = ((manifest as any)?.services || []) as Array<any>;
  const details = getThemeServiceDetails(serviceList) || getThemeServiceDetails(servicesList);
  const configuration = template?.configuration || [];
  const values = (details?.service?.theme || {}) as Record<string, any>;
  const configuredValues = configuration.reduce(
    (result, field) =>
      setTemplateConfigurationValue(
        result,
        field.id,
        getTemplateConfigurationValue(values, field.id) ?? field.defaultValue ?? defaultFieldValue(field),
      ),
    {} as Record<string, any>,
  );

  if (!manifest || !template) return null;

  const setService = (nextValues: Record<string, any> | null) => {
    const nextService = nextValues
      ? {
          id: `${manifest.id}#exhibition-viewer-theme`,
          type: "Service",
          profile: EXHIBITION_THEME_SERVICE_PROFILE,
          label: EXHIBITION_THEME_SERVICE_LABEL,
          theme: nextValues,
        }
      : null;
    const manifestRef = { id: manifest.id, type: "Manifest" } as const;
    vault.batch((batch) => {
      batch.modifyEntityField(manifestRef as any, "service", replaceThemeService(serviceList, nextService as any));
      if ((manifest as any).services || getThemeServiceDetails(servicesList)) {
        batch.modifyEntityField(manifestRef as any, "services", replaceThemeService(servicesList, null));
      }
    });
  };

  const enableService = () =>
    setService(configuredValues);

  return (
    <Sidebar>
      <SidebarContent padding>
        <ThemeSection title={template.label} description={template.summary}>
          <img src={template.thumbnailUrl} alt="" className="aspect-video w-full rounded border border-slate-200 object-cover" />
          <Button className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" onPress={openOnboarding}>
            Change template
          </Button>
        </ThemeSection>

        <ThemeSection
          title="Preview configuration"
          description="These settings are defined by the selected template and stored as a service on the Manifest."
        >
          {configuration.map((field) => (
            <TemplateConfigurationField
              key={field.id}
              field={field}
              value={getTemplateConfigurationValue(values, field.id) ?? field.defaultValue ?? defaultFieldValue(field)}
              onChange={(value) => setService(setTemplateConfigurationValue(configuredValues, field.id, value))}
            />
          ))}
          {!configuration.length ? <p className="text-sm text-slate-500">This template has no configurable settings.</p> : null}
          {details ? (
            <Button className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50" onPress={() => setService(null)}>
              Remove preview service
            </Button>
          ) : (
            <Button className="rounded bg-me-primary-600 px-3 py-2 text-sm text-white hover:bg-me-primary-700" onPress={enableService}>
              Add preview service
            </Button>
          )}
        </ThemeSection>
        <ExhibitionThemeOptions />
      </SidebarContent>
    </Sidebar>
  );
}

function defaultFieldValue(field: PresetTemplateConfigurationField) {
  if (field.type === "boolean") return false;
  if (field.type === "number") return 0;
  return "";
}

function TemplateConfigurationField({
  field,
  value,
  onChange,
}: {
  field: PresetTemplateConfigurationField;
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) {
  if (field.type === "boolean") {
    return <ThemeToggle label={field.label} checked={Boolean(value)} onChange={onChange} />;
  }
  if (field.type === "select") {
    return (
      <ThemeSelectField
        label={field.label}
        value={String(value)}
        onChange={onChange}
        options={(field.options || []).map((option) => ({ label: option.label, value: String(option.value) }))}
      />
    );
  }
  return (
    <InputContainer $wide>
      <InputLabel>{field.label}</InputLabel>
      {field.type === "textarea" ? (
        <textarea className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm" value={String(value)} onChange={(event) => onChange(event.target.value)} />
      ) : (
        <Input type={field.type === "number" ? "number" : "text"} value={String(value)} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(field.type === "number" ? event.target.valueAsNumber : event.target.value)} />
      )}
    </InputContainer>
  );
}

type ServiceDetails = {
  service: any;
} | null;

type ThemePanelMode = "simple" | "advanced";
type ThemeTarget = "presentation" | "slideshow" | "scroll";

const themeTargetOptions: Array<{ label: string; value: ThemeTarget }> = [
  { label: "Scroll", value: "scroll" },
  { label: "Slideshow", value: "slideshow" },
  { label: "Full page", value: "presentation" },
];

const previewPresetTargets: Partial<Record<PresetUrlSearchParamsPreset, ThemeTarget>> = {
  scroll: "scroll",
  slideshow: "slideshow",
};

const targetPreviewPresets: Record<ThemeTarget, PresetUrlSearchParamsPreset> = {
  presentation: "exhibition",
  scroll: "scroll",
  slideshow: "slideshow",
};

function ThemeSection({
  title,
  description,
  children,
  collapsible = false,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  collapsible?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);

  if (collapsible) {
    return (
      <section className="mb-3 rounded-md border border-slate-200 bg-white last:mb-0">
        <Button
          className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left hover:bg-slate-50"
          aria-expanded={isOpen}
          onPress={() => setIsOpen((open) => !open)}
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold">{title}</span>
            {description ? (
              <span className="mt-1 block text-xs text-slate-500">
                {description}
              </span>
            ) : null}
          </span>
          <DownIcon
            className="shrink-0 text-base text-slate-500"
            rotate={isOpen ? 0 : -90}
            aria-hidden
          />
        </Button>
        {isOpen && children ? (
          <div className="space-y-3 border-t border-slate-200 px-3 py-3">
            {children}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className="mb-5 border-b border-slate-200 pb-5 last:mb-0 last:border-b-0">
      <div className="mb-3">
        <h3 className="text-sm font-semibold">{title}</h3>
        {description ? (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        ) : null}
      </div>
      {children ? <div className="space-y-3">{children}</div> : null}
    </section>
  );
}

function ThemeInlineSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
}) {
  return (
    <div>
      <div className="mb-2 text-xs font-medium text-slate-500">{label}</div>
      <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-100 p-1">
        {options.map((option) => {
          const isActive = option.value === value;
          return (
            <Button
              key={option.value}
              className={[
                "rounded px-2 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-white font-semibold text-slate-950 shadow-sm"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900",
              ].join(" ")}
              aria-pressed={isActive}
              onPress={() => onChange(option.value)}
            >
              {option.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function ThemeToggle({
  label,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className={`flex items-center gap-3 text-sm ${disabled ? "opacity-50" : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.checked)
        }
      />
      <span>{label}</span>
    </label>
  );
}

function ThemeColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className="items-center"
      style={{
        display: "grid",
        gap: "0.5rem",
        gridTemplateColumns: "minmax(0, 1fr) 3rem 100px",
      }}
    >
      <label className="min-w-0 truncate whitespace-nowrap text-sm">
        {label}
      </label>
      <input
        className="h-9 w-12 shrink-0 cursor-pointer rounded border border-slate-300 bg-white p-1"
        type="color"
        value={toHexColor(value)}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
      />
      <div className="min-w-0">
        <Input
          style={{ width: "100%" }}
          value={value}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
        />
      </div>
    </div>
  );
}

function ThemeTextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <InputContainer $wide>
      <InputLabel>{label}</InputLabel>
      <Input
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
      />
    </InputContainer>
  );
}

function ThemeSelectField<T extends string>({
  label,
  value,
  disabled = false,
  onChange,
  options,
}: {
  label: string;
  value: T;
  disabled?: boolean;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
}) {
  return (
    <InputContainer $wide>
      <InputLabel>{label}</InputLabel>
      <select
        className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        value={value}
        disabled={disabled}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onChange(event.target.value as T)
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </InputContainer>
  );
}

function toHexColor(value: string) {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    const [r, g, b] = trimmed.slice(1);
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return "#ffffff";
}

function cloneTheme(theme: ExhibitionThemeConfig) {
  return JSON.parse(JSON.stringify(theme)) as ExhibitionThemeConfig;
}

function setThemeValue(
  theme: ExhibitionThemeConfig,
  path: string[],
  value: unknown,
) {
  const next = cloneTheme(theme) as Record<string, any>;
  let current = next;
  for (const segment of path.slice(0, -1)) {
    current[segment] ||= {};
    current = current[segment];
  }
  const finalSegment = path[path.length - 1];
  if (!finalSegment) {
    return next as ExhibitionThemeConfig;
  }
  current[finalSegment] = value;
  return next as ExhibitionThemeConfig;
}

function setThemeValues(
  theme: ExhibitionThemeConfig,
  updates: Array<{ path: string[]; value: unknown }>,
) {
  const next = cloneTheme(theme) as Record<string, any>;

  for (const update of updates) {
    let current = next;
    for (const segment of update.path.slice(0, -1)) {
      current[segment] ||= {};
      current = current[segment];
    }
    const finalSegment = update.path[update.path.length - 1];
    if (finalSegment) {
      current[finalSegment] = update.value;
    }
  }

  return next as ExhibitionThemeConfig;
}

function ExhibitionThemeOptions() {
  const manifest = useManifest();
  const vault = useVault();
  const [previewPreset, setPreviewPreset] = useExhibitionPreviewPreset();
  const [themeMode, setThemeMode] = useState<ThemePanelMode>("simple");
  const themeTarget = previewPresetTargets[previewPreset] || "presentation";
  const serviceList = ((manifest as any)?.service || []) as Array<any>;
  const servicesList = ((manifest as any)?.services || []) as Array<any>;

  const serviceDetails = useMemo<ServiceDetails>(() => {
    const directDetails = getThemeServiceDetails(serviceList);
    if (directDetails) {
      return { service: directDetails.service };
    }

    const pluralDetails = getThemeServiceDetails(servicesList);
    if (pluralDetails) {
      return { service: pluralDetails.service };
    }

    return null;
  }, [serviceList, servicesList]);

  const storedTheme = useMemo(() => {
    if (!serviceDetails) {
      return null;
    }
    return resolveThemeConfig(serviceDetails.service.theme);
  }, [serviceDetails]);

  const resolvedTheme = storedTheme || getThemePreset("delft");

  if (!manifest) {
    return null;
  }

  const upsertTheme = (nextTheme: ExhibitionThemeConfig | null) => {
    const nextService = nextTheme
      ? createThemeService(manifest.id, nextTheme)
      : null;
    const nextServiceList = replaceThemeService(serviceList, nextService);
    const nextLegacyServiceList = replaceThemeService(servicesList, null);
    const manifestRef = { id: manifest.id, type: "Manifest" } as const;

    vault.batch((batch) => {
      batch.modifyEntityField(manifestRef as any, "service", nextServiceList);

      if (
        (manifest as any).services ||
        nextLegacyServiceList.length !== servicesList.length
      ) {
        batch.modifyEntityField(
          manifestRef as any,
          "services",
          nextLegacyServiceList,
        );
      }
    });
  };

  const updatePath = (path: string[], value: unknown) => {
    upsertTheme(setThemeValue(resolvedTheme, path, value));
  };

  const updatePaths = (updates: Array<{ path: string[]; value: unknown }>) => {
    upsertTheme(setThemeValues(resolvedTheme, updates));
  };

  const setSimpleBaseColor = (value: string) => {
    const sharedBaseUpdates = [
      { path: ["delft", "tokens", "backgroundPrimary"], value },
      { path: ["delft", "tokens", "backgroundSecondary"], value },
      { path: ["delft", "tokens", "backgroundOverlay"], value },
      { path: ["delft", "tokens", "controlBar"], value },
      { path: ["delft", "tokens", "controlBarBorder"], value },
      { path: ["delft", "tokens", "closeBackground"], value },
      { path: ["delft", "tokens", "closeBackgroundHover"], value },
      { path: ["delft", "tokens", "infoBlock"], value },
      { path: ["delft", "tokens", "viewerBackground"], value },
    ];
    const titleCardUpdates =
      themeTarget === "presentation"
        ? [{ path: ["delft", "tokens", "titleCard"], value }]
        : [];

    if (themeTarget === "scroll") {
      updatePaths([
        ...sharedBaseUpdates,
        { path: ["scroll", "tokens", "titleBackground"], value },
        { path: ["scroll", "tokens", "annotationBackground"], value },
        { path: ["scroll", "tokens", "infoBlockBackground"], value },
      ]);
      return;
    }

    updatePaths([...sharedBaseUpdates, ...titleCardUpdates]);
  };

  const setSimpleTextColor = (value: string) => {
    const sharedTextUpdates = [
      { path: ["delft", "tokens", "textPrimary"], value },
      { path: ["delft", "tokens", "textSecondary"], value },
      { path: ["delft", "tokens", "imageCaption"], value },
      { path: ["delft", "tokens", "closeText"], value },
      { path: ["delft", "tokens", "infoBlockText"], value },
    ];
    const titleCardTextUpdates =
      themeTarget === "presentation"
        ? [{ path: ["delft", "tokens", "titleCardText"], value }]
        : [];

    if (themeTarget === "scroll") {
      updatePaths([
        ...sharedTextUpdates,
        { path: ["scroll", "tokens", "titleColor"], value },
        { path: ["scroll", "tokens", "annotationColor"], value },
        { path: ["scroll", "tokens", "infoBlockColor"], value },
      ]);
      return;
    }

    updatePaths([...sharedTextUpdates, ...titleCardTextUpdates]);
  };

  const setShowContentsNavigation = (value: boolean) => {
    if (themeTarget === "scroll") {
      updatePath(["scroll", "options", "showTableOfContents"], value);
      return;
    }

    updatePath(["delft", "exhibition", "hideTableOfContents"], !value);
  };

  const setTableOfContentsPlacement = (value: TableOfContentsPlacement) => {
    if (themeTarget === "scroll") {
      updatePath(["scroll", "options", "tableOfContentsPlacement"], value);
      return;
    }

    updatePath(["delft", "exhibition", "tableOfContentsPlacement"], value);
  };

  const setImageDisplayStyle = (value: "default" | "alternative") => {
    const path =
      themeTarget === "slideshow"
        ? ["delft", "slideshow", "alternativeImageMode"]
        : ["delft", "exhibition", "alternativeImageMode"];
    updatePath(path, value === "alternative");
  };

  const setCoverImages = (value: boolean) => {
    const path =
      themeTarget === "slideshow"
        ? ["delft", "slideshow", "coverImages"]
        : ["delft", "exhibition", "coverImages"];
    updatePath(path, value);
  };

  const showContentsNavigation =
    themeTarget === "scroll"
      ? resolvedTheme.scroll.options.showTableOfContents
      : !resolvedTheme.delft.exhibition.hideTableOfContents;
  const tableOfContentsPlacement =
    themeTarget === "scroll"
      ? resolvedTheme.scroll.options.tableOfContentsPlacement
      : resolvedTheme.delft.exhibition.tableOfContentsPlacement;
  const imageDisplayStyle =
    (themeTarget === "slideshow"
      ? resolvedTheme.delft.slideshow.alternativeImageMode
      : resolvedTheme.delft.exhibition.alternativeImageMode)
      ? "alternative"
      : "default";
  const coverImages =
    themeTarget === "slideshow"
      ? resolvedTheme.delft.slideshow.coverImages
      : resolvedTheme.delft.exhibition.coverImages;
  const progressBarEnabled =
    themeTarget === "scroll"
      ? resolvedTheme.scroll.options.showProgressBar
      : resolvedTheme.delft.exhibition.showProgressBar;

  const selectThemeTarget = (target: ThemeTarget) => {
    setPreviewPreset(targetPreviewPresets[target]);
  };

  const enableTheme = (enabled: boolean) => {
    if (!enabled) {
      upsertTheme(null);
      return;
    }
    upsertTheme(getThemePreset("delft"));
  };

  const setPreset = (preset: ExhibitionThemePreset) => {
    upsertTheme(getThemePreset(preset));
  };

  const resetToPreset = () => {
    upsertTheme(getThemePreset(resolvedTheme.preset));
  };

  return (
    <>
        <ThemeSection
          title="Preview"
          description="Choose which exhibition format to preview while editing this theme."
        >
          <ThemeInlineSelect<ThemeTarget>
            label="Preview format"
            value={themeTarget}
            onChange={selectThemeTarget}
            options={themeTargetOptions}
          />
        </ThemeSection>

        <ThemeSection
          title="Saved Theme"
          description="Save custom exhibition styling and viewer defaults on the Manifest."
        >
          <ThemeToggle
            label="Save custom theme"
            checked={!!serviceDetails}
            onChange={enableTheme}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              onPress={resetToPreset}
              isDisabled={!serviceDetails}
            >
              Reset selected theme
            </Button>
            <Button
              className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              onPress={() => upsertTheme(null)}
              isDisabled={!serviceDetails}
            >
              Clear saved settings
            </Button>
          </div>

          <ThemeInlineSelect<ExhibitionThemePreset>
            label="Preset"
            value={resolvedTheme.preset}
            onChange={setPreset}
            options={[
              { label: "Delft", value: "delft" },
              { label: "Gallery", value: "gallery" },
              { label: "Minimal", value: "minimal" },
            ]}
          />
        </ThemeSection>

        <ThemeSection
          title="Theme Options"
          description="Choose a shorter or more detailed set of theme controls."
        >
          <ThemeInlineSelect<ThemePanelMode>
            label="Editing mode"
            value={themeMode}
            onChange={setThemeMode}
            options={[
              { label: "Simple", value: "simple" },
              { label: "Advanced", value: "advanced" },
            ]}
          />
        </ThemeSection>

        {themeMode === "simple" ? (
          <ThemeSection
            title="Key Settings"
            description={
              themeTarget === "scroll"
                ? "Main background updates the opening title, annotation cards, info blocks, and viewer background."
                : "The main controls most people need for this theme."
            }
          >
            <ThemeColorField
              label="Main background"
              value={
                themeTarget === "scroll"
                  ? resolvedTheme.scroll.tokens.titleBackground
                  : resolvedTheme.delft.tokens.viewerBackground
              }
              onChange={setSimpleBaseColor}
            />
            <ThemeColorField
              label="Text colour"
              value={
                themeTarget === "scroll"
                  ? resolvedTheme.scroll.tokens.titleColor
                  : resolvedTheme.delft.tokens.textSecondary
              }
              onChange={setSimpleTextColor}
            />
            <ThemeTextField
              label="Heading font"
              value={resolvedTheme.shared.fontSans}
              onChange={(value) => updatePath(["shared", "fontSans"], value)}
            />
            <ThemeTextField
              label="Body font"
              value={resolvedTheme.shared.fontMono}
              onChange={(value) => updatePath(["shared", "fontMono"], value)}
            />
            {themeTarget !== "scroll" ? (
              <ThemeSelectField<TitleTransform>
                label="Title capitalisation"
                value={resolvedTheme.shared.titleTransform}
                onChange={(value) =>
                  updatePath(["shared", "titleTransform"], value)
                }
                options={[
                  { label: "Uppercase", value: "uppercase" },
                  { label: "None", value: "none" },
                  { label: "Capitalize", value: "capitalize" },
                ]}
              />
            ) : null}
            {themeTarget === "presentation" ? (
              <>
                <ThemeToggle
                  label="Table of Contents bar"
                  checked={showContentsNavigation}
                  onChange={setShowContentsNavigation}
                />
                <ThemeToggle
                  label="Full-width title bar"
                  checked={resolvedTheme.delft.exhibition.fullTitleBar}
                  onChange={(value) =>
                    updatePath(["delft", "exhibition", "fullTitleBar"], value)
                  }
                />
                <ThemeSelectField<"default" | "alternative">
                  label="Image layout"
                  value={imageDisplayStyle}
                  onChange={setImageDisplayStyle}
                  options={[
                    { label: "Standard", value: "default" },
                    { label: "Feature image", value: "alternative" },
                  ]}
                />
                <ThemeToggle
                  label="Fill image area"
                  checked={coverImages}
                  onChange={setCoverImages}
                />
              </>
            ) : null}
            {themeTarget === "slideshow" ? (
              <>
                <ThemeSelectField<"default" | "alternative">
                  label="Image layout"
                  value={imageDisplayStyle}
                  onChange={setImageDisplayStyle}
                  options={[
                    { label: "Standard", value: "default" },
                    { label: "Feature image", value: "alternative" },
                  ]}
                />
                <ThemeToggle
                  label="Fill image area"
                  checked={coverImages}
                  onChange={setCoverImages}
                />
                <ThemeToggle
                  label="Zoom effect"
                  checked={resolvedTheme.delft.slideshow.transitionScale}
                  onChange={(value) =>
                    updatePath(["delft", "slideshow", "transitionScale"], value)
                  }
                />
              </>
            ) : null}
            {themeTarget === "scroll" ? (
              <>
                <ThemeToggle
                  label="Full-height title"
                  checked={resolvedTheme.scroll.options.titleBlock.fullHeight}
                  onChange={(value) =>
                    updatePath(
                      ["scroll", "options", "titleBlock", "fullHeight"],
                      value,
                    )
                  }
                />
              </>
            ) : null}
          </ThemeSection>
        ) : (
          <>
            {themeTarget === "presentation" ? (
              <ThemeSection title="Opening Title" collapsible>
                <ThemeColorField
                  label="Card background"
                  value={resolvedTheme.delft.tokens.titleCard}
                  onChange={(value) =>
                    updatePath(["delft", "tokens", "titleCard"], value)
                  }
                />
                <ThemeColorField
                  label="Card text"
                  value={resolvedTheme.delft.tokens.titleCardText}
                  onChange={(value) =>
                    updatePath(["delft", "tokens", "titleCardText"], value)
                  }
                />
                <ThemeToggle
                  label="Hide title"
                  checked={resolvedTheme.delft.exhibition.hideTitle}
                  onChange={(value) =>
                    updatePath(["delft", "exhibition", "hideTitle"], value)
                  }
                />
                <ThemeToggle
                  label="Hide title card"
                  checked={resolvedTheme.delft.exhibition.hideTitleCard}
                  onChange={(value) =>
                    updatePath(["delft", "exhibition", "hideTitleCard"], value)
                  }
                />
              </ThemeSection>
            ) : null}

            {themeTarget === "scroll" ? (
              <ThemeSection title="Opening Title" collapsible>
                <ThemeToggle
                  label="Show opening title"
                  checked={resolvedTheme.scroll.options.showTitleBlock}
                  onChange={(value) =>
                    updatePath(["scroll", "options", "showTitleBlock"], value)
                  }
                />
                <ThemeToggle
                  label="Show table of contents"
                  checked={showContentsNavigation}
                  onChange={setShowContentsNavigation}
                />
                <ThemeColorField
                  label="Background"
                  value={resolvedTheme.scroll.tokens.titleBackground}
                  onChange={(value) =>
                    updatePath(["scroll", "tokens", "titleBackground"], value)
                  }
                />
                <ThemeColorField
                  label="Text"
                  value={resolvedTheme.scroll.tokens.titleColor}
                  onChange={(value) =>
                    updatePath(["scroll", "tokens", "titleColor"], value)
                  }
                />
                <ThemeToggle
                  label="Full-height title"
                  checked={resolvedTheme.scroll.options.titleBlock.fullHeight}
                  onChange={(value) =>
                    updatePath(
                      ["scroll", "options", "titleBlock", "fullHeight"],
                      value,
                    )
                  }
                />
              </ThemeSection>
            ) : null}

            <ThemeSection
              title="Page & Viewer"
              description={
                themeTarget === "scroll"
                  ? "Shared backgrounds around the Scroll view. Opening title, annotation, and info block colours are controlled below."
                  : undefined
              }
              collapsible
            >
              <ThemeColorField
                label="Viewer background"
                value={resolvedTheme.delft.tokens.viewerBackground}
                onChange={(value) =>
                  updatePath(["delft", "tokens", "viewerBackground"], value)
                }
              />
              <ThemeColorField
                label="Main"
                value={resolvedTheme.delft.tokens.backgroundPrimary}
                onChange={(value) =>
                  updatePath(["delft", "tokens", "backgroundPrimary"], value)
                }
              />
              <ThemeColorField
                label="Secondary"
                value={resolvedTheme.delft.tokens.backgroundSecondary}
                onChange={(value) =>
                  updatePath(["delft", "tokens", "backgroundSecondary"], value)
                }
              />
              <ThemeColorField
                label="Overlay"
                value={resolvedTheme.delft.tokens.backgroundOverlay}
                onChange={(value) =>
                  updatePath(["delft", "tokens", "backgroundOverlay"], value)
                }
              />
              {themeTarget === "scroll" ? (
                <ThemeToggle
                  label="Use theme background instead of canvas colours"
                  checked={resolvedTheme.scroll.options.ignoreCanvasBackgrounds}
                  onChange={(value) =>
                    updatePath(
                      ["scroll", "options", "ignoreCanvasBackgrounds"],
                      value,
                    )
                  }
                />
              ) : null}
            </ThemeSection>

            {themeTarget !== "scroll" ? (
              <ThemeSection
                title="Text Colours"
                description="General fallback text colours. Captions, info blocks, and controls have their own options below."
                collapsible
              >
                <ThemeColorField
                  label="Dark text"
                  value={resolvedTheme.delft.tokens.textPrimary}
                  onChange={(value) =>
                    updatePath(["delft", "tokens", "textPrimary"], value)
                  }
                />
                <ThemeColorField
                  label="Light text"
                  value={resolvedTheme.delft.tokens.textSecondary}
                  onChange={(value) =>
                    updatePath(["delft", "tokens", "textSecondary"], value)
                  }
                />
              </ThemeSection>
            ) : null}

            <ThemeSection title="Info Blocks" collapsible>
              {themeTarget === "scroll" ? (
                <>
                  <ThemeColorField
                    label="Background"
                    value={resolvedTheme.scroll.tokens.infoBlockBackground}
                    onChange={(value) =>
                      updatePath(
                        ["scroll", "tokens", "infoBlockBackground"],
                        value,
                      )
                    }
                  />
                  <ThemeColorField
                    label="Text"
                    value={resolvedTheme.scroll.tokens.infoBlockColor}
                    onChange={(value) =>
                      updatePath(["scroll", "tokens", "infoBlockColor"], value)
                    }
                  />
                </>
              ) : (
                <>
                  <ThemeColorField
                    label="Background"
                    value={resolvedTheme.delft.tokens.infoBlock}
                    onChange={(value) =>
                      updatePath(["delft", "tokens", "infoBlock"], value)
                    }
                  />
                  <ThemeColorField
                    label="Text"
                    value={resolvedTheme.delft.tokens.infoBlockText}
                    onChange={(value) =>
                      updatePath(["delft", "tokens", "infoBlockText"], value)
                    }
                  />
                </>
              )}
            </ThemeSection>

            <ThemeSection title="Images & Annotations" collapsible>
              {themeTarget !== "scroll" ? (
                <>
                  <ThemeColorField
                    label="Image caption"
                    value={resolvedTheme.delft.tokens.imageCaption}
                    onChange={(value) =>
                      updatePath(["delft", "tokens", "imageCaption"], value)
                    }
                  />
                  <ThemeColorField
                    label="Selected hotspot"
                    value={resolvedTheme.delft.tokens.annotationSelected}
                    onChange={(value) =>
                      updatePath(["delft", "tokens", "annotationSelected"], value)
                    }
                  />
                  <ThemeSelectField<"default" | "alternative">
                    label="Image layout"
                    value={imageDisplayStyle}
                    onChange={setImageDisplayStyle}
                    options={[
                      { label: "Standard", value: "default" },
                      { label: "Feature image", value: "alternative" },
                    ]}
                  />
                  <ThemeToggle
                    label="Info button"
                    checked={
                      themeTarget === "slideshow"
                        ? resolvedTheme.delft.slideshow.imageInfoIcon
                        : resolvedTheme.delft.exhibition.imageInfoIcon
                    }
                    onChange={(value) =>
                      updatePath(
                        themeTarget === "slideshow"
                          ? ["delft", "slideshow", "imageInfoIcon"]
                          : ["delft", "exhibition", "imageInfoIcon"],
                        value,
                      )
                    }
                  />
                  <ThemeToggle
                    label="Fill image area"
                    checked={coverImages}
                    onChange={setCoverImages}
                  />
                  <ThemeToggle
                    label="Use theme background instead of canvas colours"
                    checked={
                      themeTarget === "slideshow"
                        ? resolvedTheme.delft.slideshow.ignoreCanvasBackgrounds
                        : resolvedTheme.delft.exhibition.ignoreCanvasBackgrounds
                    }
                    onChange={(value) =>
                      updatePath(
                        themeTarget === "slideshow"
                          ? ["delft", "slideshow", "ignoreCanvasBackgrounds"]
                          : ["delft", "exhibition", "ignoreCanvasBackgrounds"],
                        value,
                      )
                    }
                  />
                </>
              ) : null}
              {themeTarget === "scroll" ? (
                <>
                  <ThemeColorField
                    label="Annotation background"
                    value={resolvedTheme.scroll.tokens.annotationBackground}
                    onChange={(value) =>
                      updatePath(
                        ["scroll", "tokens", "annotationBackground"],
                        value,
                      )
                    }
                  />
                  <ThemeColorField
                    label="Annotation text"
                    value={resolvedTheme.scroll.tokens.annotationColor}
                    onChange={(value) =>
                      updatePath(["scroll", "tokens", "annotationColor"], value)
                    }
                  />
                  <ThemeTextField
                    label="Corner radius"
                    value={resolvedTheme.scroll.tokens.annotationRadius}
                    onChange={(value) =>
                      updatePath(["scroll", "tokens", "annotationRadius"], value)
                    }
                  />
                  <ThemeTextField
                    label="Max width"
                    value={resolvedTheme.scroll.tokens.annotationMaxWidth}
                    onChange={(value) =>
                      updatePath(
                        ["scroll", "tokens", "annotationMaxWidth"],
                        value,
                      )
                    }
                  />
                </>
              ) : null}
            </ThemeSection>

            <ThemeSection
              title="Navigation & Controls"
              description={
                themeTarget === "scroll"
                  ? "Scroll contents navigation, placement, dropdown text, and progress colours."
                  : themeTarget === "slideshow"
                    ? "Slideshow controls, progress, and overlay buttons. Contents controls only apply to Full page and Scroll."
                    : "Contents, viewer controls, progress, and overlay buttons."
              }
              collapsible
            >
              {themeTarget === "presentation" || themeTarget === "scroll" ? (
                <ThemeToggle
                  label="Progress bar"
                  checked={progressBarEnabled}
                  onChange={(value) =>
                    updatePath(
                      themeTarget === "scroll"
                        ? ["scroll", "options", "showProgressBar"]
                        : ["delft", "exhibition", "showProgressBar"],
                      value,
                    )
                  }
                />
              ) : null}
              {themeTarget === "presentation" || themeTarget === "scroll" ? (
                <ThemeToggle
                  label="Previous/next side controls"
                  checked={
                    themeTarget === "scroll"
                      ? resolvedTheme.scroll.options.showNavigationControls
                      : resolvedTheme.delft.exhibition.showNavigationControls
                  }
                  onChange={(value) =>
                    updatePath(
                      themeTarget === "scroll"
                        ? ["scroll", "options", "showNavigationControls"]
                        : ["delft", "exhibition", "showNavigationControls"],
                      value,
                    )
                  }
                />
              ) : null}
              {themeTarget === "presentation" ? (
                <ThemeToggle
                  label="Table of Contents bar"
                  checked={showContentsNavigation}
                  onChange={setShowContentsNavigation}
                />
              ) : null}
              {themeTarget === "presentation" || themeTarget === "scroll" ? (
                <ThemeSelectField<TableOfContentsPlacement>
                  label="Contents position"
                  value={tableOfContentsPlacement}
                  disabled={!showContentsNavigation}
                  onChange={setTableOfContentsPlacement}
                  options={[
                    { label: "Header", value: "header" },
                    { label: "Footer", value: "footer" },
                  ]}
                />
              ) : null}
              {themeTarget === "scroll" ? (
                <ThemeToggle
                  label="Back to top button"
                  checked={resolvedTheme.scroll.options.showScrollToTop}
                  onChange={(value) =>
                    updatePath(["scroll", "options", "showScrollToTop"], value)
                  }
                />
              ) : null}
              <ThemeColorField
                label="Navigation bar background"
                value={resolvedTheme.delft.tokens.controlBar}
                onChange={(value) =>
                  updatePaths([
                    { path: ["delft", "tokens", "controlBar"], value },
                    { path: ["delft", "tokens", "controlBarBorder"], value },
                  ])
                }
              />
              <ThemeColorField
                label="Navigation text colour"
                value={resolvedTheme.delft.tokens.closeText}
                onChange={(value) =>
                  updatePath(["delft", "tokens", "closeText"], value)
                }
              />
              <ThemeColorField
                label="Progress bar colour"
                value={resolvedTheme.delft.tokens.progressBar}
                onChange={(value) =>
                  updatePath(["delft", "tokens", "progressBar"], value)
                }
              />
              {themeTarget !== "scroll" ? (
                <>
                  <ThemeColorField
                    label="Close button background"
                    value={resolvedTheme.delft.tokens.closeBackground}
                    onChange={(value) =>
                      updatePath(["delft", "tokens", "closeBackground"], value)
                    }
                  />
                  <ThemeColorField
                    label="Close button hover"
                    value={resolvedTheme.delft.tokens.closeBackgroundHover}
                    onChange={(value) =>
                      updatePath(
                        ["delft", "tokens", "closeBackgroundHover"],
                        value,
                      )
                    }
                  />
                </>
              ) : (
                <ThemeColorField
                  label="Back to top button background"
                  value={resolvedTheme.delft.tokens.closeBackground}
                  onChange={(value) =>
                    updatePath(["delft", "tokens", "closeBackground"], value)
                  }
                />
              )}
            </ThemeSection>

            {themeTarget === "presentation" ? (
              <>
                <ThemeSection title="Display & Layout" collapsible>
                  <ThemeToggle
                    label="Angled corners"
                    checked={resolvedTheme.delft.exhibition.cutCorners}
                    onChange={(value) =>
                      updatePath(["delft", "exhibition", "cutCorners"], value)
                    }
                  />
                  <ThemeToggle
                    label="Full-width title bar"
                    checked={resolvedTheme.delft.exhibition.fullTitleBar}
                    onChange={(value) =>
                      updatePath(["delft", "exhibition", "fullTitleBar"], value)
                    }
                  />
                  <ThemeToggle
                    label="Full-width item grid"
                    checked={resolvedTheme.delft.exhibition.fullWidthGrid}
                    onChange={(value) =>
                      updatePath(["delft", "exhibition", "fullWidthGrid"], value)
                    }
                  />
                  <ThemeToggle
                    label="Use theme background instead of canvas colours"
                    checked={resolvedTheme.delft.exhibition.ignoreCanvasBackgrounds}
                    onChange={(value) =>
                      updatePath(
                        ["delft", "exhibition", "ignoreCanvasBackgrounds"],
                        value,
                      )
                    }
                  />
                </ThemeSection>
                <ThemeSection title="Interaction Behaviour" collapsible>
                  <ThemeSelectField<"available" | "disabled">
                    label="Presentation mode"
                    value={
                      resolvedTheme.delft.exhibition.disablePresentation
                        ? "disabled"
                        : "available"
                    }
                    onChange={(value) =>
                      updatePath(
                        ["delft", "exhibition", "disablePresentation"],
                        value === "disabled",
                      )
                    }
                    options={[
                      { label: "Available", value: "available" },
                      { label: "Disabled", value: "disabled" },
                    ]}
                  />
                  <ThemeToggle
                    label="Zoom effect"
                    checked={resolvedTheme.delft.exhibition.transitionScale}
                    onChange={(value) =>
                      updatePath(["delft", "exhibition", "transitionScale"], value)
                    }
                  />
                  <ThemeToggle
                    label="Floating panels"
                    checked={resolvedTheme.delft.presentation.isFloating}
                    onChange={(value) =>
                      updatePath(["delft", "presentation", "isFloating"], value)
                    }
                  />
                  {resolvedTheme.delft.presentation.isFloating ? (
                    <ThemeToggle
                      label="Label-only floating"
                      checked={resolvedTheme.delft.presentation.labelOnlyFloating}
                      onChange={(value) =>
                        updatePath(
                          ["delft", "presentation", "labelOnlyFloating"],
                          value,
                        )
                      }
                    />
                  ) : null}
                  {resolvedTheme.delft.presentation.isFloating ? (
                    <ThemeSelectField<FloatingPosition>
                      label="Panel position"
                      value={resolvedTheme.delft.presentation.floatingPosition}
                      onChange={(value) =>
                        updatePath(
                          ["delft", "presentation", "floatingPosition"],
                          value,
                        )
                      }
                      options={[
                        { label: "Top left", value: "top-left" },
                        { label: "Top right", value: "top-right" },
                        { label: "Bottom left", value: "bottom-left" },
                        { label: "Bottom right", value: "bottom-right" },
                        { label: "Top", value: "top" },
                        { label: "Bottom", value: "bottom" },
                        { label: "Left", value: "left" },
                        { label: "Right", value: "right" },
                      ]}
                    />
                  ) : null}
                  <ThemeToggle
                    label="Angled panel corners"
                    checked={resolvedTheme.delft.presentation.cutCorners}
                    onChange={(value) =>
                      updatePath(["delft", "presentation", "cutCorners"], value)
                    }
                  />
                  <ThemeToggle
                    label="Use theme background instead of canvas colours"
                    checked={resolvedTheme.delft.presentation.ignoreCanvasBackgrounds}
                    onChange={(value) =>
                      updatePath(
                        ["delft", "presentation", "ignoreCanvasBackgrounds"],
                        value,
                      )
                    }
                  />
                </ThemeSection>
              </>
            ) : null}

            {themeTarget === "slideshow" ? (
              <ThemeSection title="Interaction Behaviour" collapsible>
                <ThemeToggle
                  label="Zoom effect"
                  checked={resolvedTheme.delft.slideshow.transitionScale}
                  onChange={(value) =>
                    updatePath(["delft", "slideshow", "transitionScale"], value)
                  }
                />
              </ThemeSection>
            ) : null}
          </>
        )}
    </>
  );
}

function ThemeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 -960 960 960"
    >
      <title>Theme</title>
      <path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 32.5-156T201-763q56-54 131-85.5T492-880q79 0 147 27t120 74q52 47 81.5 110T870-533q0 93-56 147t-145 54h-72q-18 0-28 10t-10 25q0 15 12 31.5t12 39.5q0 55-29 100.5T480-80ZM280-480q25 0 42.5-17.5T340-540q0-25-17.5-42.5T280-600q-25 0-42.5 17.5T220-540q0 25 17.5 42.5T280-480Zm120-160q25 0 42.5-17.5T460-700q0-25-17.5-42.5T400-760q-25 0-42.5 17.5T340-700q0 25 17.5 42.5T400-640Zm160 0q25 0 42.5-17.5T620-700q0-25-17.5-42.5T560-760q-25 0-42.5 17.5T500-700q0 25 17.5 42.5T560-640Zm120 160q25 0 42.5-17.5T740-540q0-25-17.5-42.5T680-600q-25 0-42.5 17.5T620-540q0 25 17.5 42.5T680-480Z" />
    </svg>
  );
}

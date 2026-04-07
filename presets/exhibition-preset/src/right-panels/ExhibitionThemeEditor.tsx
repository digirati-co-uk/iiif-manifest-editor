import { Sidebar, SidebarContent } from "@manifest-editor/components";
import { Input, InputContainer, InputLabel } from "@manifest-editor/editors";
import { type EditorDefinition, useEditor } from "@manifest-editor/shell";
import { type ChangeEvent, type ReactNode, useMemo } from "react";
import { Button } from "react-aria-components";
import { useManifest, useVault } from "react-iiif-vault";
import type {
  ExhibitionThemeConfig,
  ExhibitionThemePreset,
  FloatingPosition,
  TitleTransform,
} from "../theme/theme-service";
import {
  createThemeService,
  getThemePreset,
  getThemeServiceDetails,
  replaceThemeService,
  resolveThemeConfig,
} from "../theme/theme-service";

export const exhibitionThemeEditor: EditorDefinition = {
  id: "@exhibition/theme-editor",
  label: "Theme",
  supports: {
    edit: true,
    properties: ["service"],
    resourceTypes: ["Manifest"],
  },
  component: () => <ExhibitionThemePanel />,
};

type ServiceDetails = {
  service: any;
} | null;

function ThemeSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 pb-5 mb-5">
      <div className="mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        {description ? (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        ) : null}
      </div>
      {children ? <div className="space-y-3">{children}</div> : null}
    </section>
  );
}

function ThemeToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
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
    <div className="grid grid-cols-[1fr_auto] items-center gap-3">
      <label className="text-sm">{label}</label>
      <div className="flex items-center gap-2">
        <input
          className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-white p-1"
          type="color"
          value={toHexColor(value)}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChange(event.target.value)
          }
        />
        <Input
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
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ label: string; value: T }>;
}) {
  return (
    <InputContainer $wide>
      <InputLabel>{label}</InputLabel>
      <select
        className="w-full rounded border border-slate-300 bg-slate-50 px-3 py-2 text-sm"
        value={value}
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

function ExhibitionThemePanel() {
  const manifest = useManifest();
  const vault = useVault();
  const editor = useEditor();
  const serviceList = editor.linking.service.get() || [];
  const servicesList = editor.linking.services.get() || [];

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
    <Sidebar>
      <SidebarContent padding>
        <ThemeSection
          title="Manifest Theme"
          description="Store exhibition styling and viewer defaults in a custom IIIF service on the Manifest."
        >
          <ThemeToggle
            label="Enable manifest theme"
            checked={!!serviceDetails}
            onChange={enableTheme}
          />

          <div className="flex flex-wrap gap-2">
            <Button
              className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              onPress={resetToPreset}
              isDisabled={!serviceDetails}
            >
              Reset to preset
            </Button>
            <Button
              className="rounded border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
              onPress={() => upsertTheme(null)}
              isDisabled={!serviceDetails}
            >
              Remove theme service
            </Button>
          </div>

          <ThemeSelectField<ExhibitionThemePreset>
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

        <ThemeSection title="Typography">
          <ThemeTextField
            label="Sans font stack"
            value={resolvedTheme.shared.fontSans}
            onChange={(value) => updatePath(["shared", "fontSans"], value)}
          />
          <ThemeTextField
            label="Mono font stack"
            value={resolvedTheme.shared.fontMono}
            onChange={(value) => updatePath(["shared", "fontMono"], value)}
          />
          <ThemeSelectField<TitleTransform>
            label="Title transform"
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
        </ThemeSection>

        <ThemeSection title="Delft Colors">
          <ThemeColorField
            label="Background"
            value={resolvedTheme.delft.tokens.backgroundPrimary}
            onChange={(value) =>
              updatePath(["delft", "tokens", "backgroundPrimary"], value)
            }
          />
          <ThemeColorField
            label="Secondary background"
            value={resolvedTheme.delft.tokens.backgroundSecondary}
            onChange={(value) =>
              updatePath(["delft", "tokens", "backgroundSecondary"], value)
            }
          />
          <ThemeColorField
            label="Primary text"
            value={resolvedTheme.delft.tokens.textPrimary}
            onChange={(value) =>
              updatePath(["delft", "tokens", "textPrimary"], value)
            }
          />
          <ThemeColorField
            label="Secondary text"
            value={resolvedTheme.delft.tokens.textSecondary}
            onChange={(value) =>
              updatePath(["delft", "tokens", "textSecondary"], value)
            }
          />
          <ThemeColorField
            label="Title card"
            value={resolvedTheme.delft.tokens.titleCard}
            onChange={(value) =>
              updatePath(["delft", "tokens", "titleCard"], value)
            }
          />
          <ThemeColorField
            label="Title card text"
            value={resolvedTheme.delft.tokens.titleCardText}
            onChange={(value) =>
              updatePath(["delft", "tokens", "titleCardText"], value)
            }
          />
          <ThemeColorField
            label="Info block"
            value={resolvedTheme.delft.tokens.infoBlock}
            onChange={(value) =>
              updatePath(["delft", "tokens", "infoBlock"], value)
            }
          />
          <ThemeColorField
            label="Info block text"
            value={resolvedTheme.delft.tokens.infoBlockText}
            onChange={(value) =>
              updatePath(["delft", "tokens", "infoBlockText"], value)
            }
          />
          <ThemeColorField
            label="Control bar"
            value={resolvedTheme.delft.tokens.controlBar}
            onChange={(value) =>
              updatePath(["delft", "tokens", "controlBar"], value)
            }
          />
          <ThemeColorField
            label="Viewer background"
            value={resolvedTheme.delft.tokens.viewerBackground}
            onChange={(value) =>
              updatePath(["delft", "tokens", "viewerBackground"], value)
            }
          />
        </ThemeSection>

        <ThemeSection title="Scroll Colors">
          <ThemeColorField
            label="Title background"
            value={resolvedTheme.scroll.tokens.titleBackground}
            onChange={(value) =>
              updatePath(["scroll", "tokens", "titleBackground"], value)
            }
          />
          <ThemeColorField
            label="Title text"
            value={resolvedTheme.scroll.tokens.titleColor}
            onChange={(value) =>
              updatePath(["scroll", "tokens", "titleColor"], value)
            }
          />
          <ThemeColorField
            label="Annotation background"
            value={resolvedTheme.scroll.tokens.annotationBackground}
            onChange={(value) =>
              updatePath(["scroll", "tokens", "annotationBackground"], value)
            }
          />
          <ThemeColorField
            label="Annotation text"
            value={resolvedTheme.scroll.tokens.annotationColor}
            onChange={(value) =>
              updatePath(["scroll", "tokens", "annotationColor"], value)
            }
          />
          <ThemeColorField
            label="Info block background"
            value={resolvedTheme.scroll.tokens.infoBlockBackground}
            onChange={(value) =>
              updatePath(["scroll", "tokens", "infoBlockBackground"], value)
            }
          />
          <ThemeColorField
            label="Info block text"
            value={resolvedTheme.scroll.tokens.infoBlockColor}
            onChange={(value) =>
              updatePath(["scroll", "tokens", "infoBlockColor"], value)
            }
          />
        </ThemeSection>

        <ThemeSection title="Exhibition Defaults">
          <ThemeToggle
            label="Cut corners"
            checked={resolvedTheme.delft.exhibition.cutCorners}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "cutCorners"], value)
            }
          />
          <ThemeToggle
            label="Full title bar"
            checked={resolvedTheme.delft.exhibition.fullTitleBar}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "fullTitleBar"], value)
            }
          />
          <ThemeToggle
            label="Full width grid"
            checked={resolvedTheme.delft.exhibition.fullWidthGrid}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "fullWidthGrid"], value)
            }
          />
          <ThemeToggle
            label="Hide table of contents"
            checked={resolvedTheme.delft.exhibition.hideTableOfContents}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "hideTableOfContents"], value)
            }
          />
          <ThemeToggle
            label="Disable presentation mode"
            checked={resolvedTheme.delft.exhibition.disablePresentation}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "disablePresentation"], value)
            }
          />
          <ThemeToggle
            label="Hide title card"
            checked={resolvedTheme.delft.exhibition.hideTitleCard}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "hideTitleCard"], value)
            }
          />
          <ThemeToggle
            label="Alternative image mode"
            checked={resolvedTheme.delft.exhibition.alternativeImageMode}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "alternativeImageMode"], value)
            }
          />
          <ThemeToggle
            label="Transition scale"
            checked={resolvedTheme.delft.exhibition.transitionScale}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "transitionScale"], value)
            }
          />
          <ThemeToggle
            label="Image info icon"
            checked={resolvedTheme.delft.exhibition.imageInfoIcon}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "imageInfoIcon"], value)
            }
          />
          <ThemeToggle
            label="Cover images"
            checked={resolvedTheme.delft.exhibition.coverImages}
            onChange={(value) =>
              updatePath(["delft", "exhibition", "coverImages"], value)
            }
          />
        </ThemeSection>

        <ThemeSection title="Presentation Defaults">
          <ThemeToggle
            label="Cut corners"
            checked={resolvedTheme.delft.presentation.cutCorners}
            onChange={(value) =>
              updatePath(["delft", "presentation", "cutCorners"], value)
            }
          />
          <ThemeToggle
            label="Floating caption panels"
            checked={resolvedTheme.delft.presentation.isFloating}
            onChange={(value) =>
              updatePath(["delft", "presentation", "isFloating"], value)
            }
          />
          <ThemeSelectField<FloatingPosition>
            label="Floating position"
            value={resolvedTheme.delft.presentation.floatingPosition}
            onChange={(value) =>
              updatePath(["delft", "presentation", "floatingPosition"], value)
            }
            options={[
              { label: "Top left", value: "top-left" },
              { label: "Top right", value: "top-right" },
              { label: "Bottom left", value: "bottom-left" },
              { label: "Bottom right", value: "bottom-right" },
            ]}
          />
        </ThemeSection>

        <ThemeSection title="Slideshow Defaults">
          <ThemeToggle
            label="Alternative image mode"
            checked={resolvedTheme.delft.slideshow.alternativeImageMode}
            onChange={(value) =>
              updatePath(["delft", "slideshow", "alternativeImageMode"], value)
            }
          />
          <ThemeToggle
            label="Transition scale"
            checked={resolvedTheme.delft.slideshow.transitionScale}
            onChange={(value) =>
              updatePath(["delft", "slideshow", "transitionScale"], value)
            }
          />
          <ThemeToggle
            label="Image info icon"
            checked={resolvedTheme.delft.slideshow.imageInfoIcon}
            onChange={(value) =>
              updatePath(["delft", "slideshow", "imageInfoIcon"], value)
            }
          />
          <ThemeToggle
            label="Cover images"
            checked={resolvedTheme.delft.slideshow.coverImages}
            onChange={(value) =>
              updatePath(["delft", "slideshow", "coverImages"], value)
            }
          />
        </ThemeSection>

        <ThemeSection title="Scroll Defaults">
          <ThemeToggle
            label="Show table of contents"
            checked={resolvedTheme.scroll.options.showTableOfContents}
            onChange={(value) =>
              updatePath(["scroll", "options", "showTableOfContents"], value)
            }
          />
          <ThemeToggle
            label="Full-height title block"
            checked={resolvedTheme.scroll.options.titleBlock.fullHeight}
            onChange={(value) =>
              updatePath(
                ["scroll", "options", "titleBlock", "fullHeight"],
                value,
              )
            }
          />
        </ThemeSection>
      </SidebarContent>
    </Sidebar>
  );
}

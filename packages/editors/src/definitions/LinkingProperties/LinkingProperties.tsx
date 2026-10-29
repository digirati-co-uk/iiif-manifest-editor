import { propertyLabels } from "@manifest-editor/editor-api";
import { useDisplayLabel } from "../../i18n";
import { useTranslations } from "@manifest-editor/i18n";
import { toRef } from "@iiif/parser";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useAppResource, useCreator, useEditingResource, useEditor, useLayoutActions } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { FlexContainer } from "@manifest-editor/ui/components/layout/FlexContainer";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { CanvasContext, useResourceContext, useVaultSelector } from "react-iiif-vault";
import { CanvasListPreview } from "../../components/CanvasListPreview/CanvasListPreview";
import { ContentResourceList } from "../../components/ContentResourceList/ContentResourceList";
import { InputContainer, InputLabel, InputLabelEdit } from "../../components/Input";
import {
  IIIFBrowserFromPartOfButton,
  LinkingPropertyList,
} from "../../components/LinkingPropertyList/LinkingPropertyList";
import { useToggleList } from "../../helpers";
import { createAppActions } from "../../helpers/create-app-actions";

export function useCreators() {}

export function LinkingProperties() {
  const commonT = useTranslations("common");
  const t = useTranslations("editors");
  const apiLabel = useDisplayLabel();
  const resource = useEditingResource();
  const appResource = useAppResource();
  const { create } = useLayoutActions();
  const { manifest: contextManifestId } = useResourceContext();
  const { linking, notAllowed } = useEditor();
  const { seeAlso, rendering, partOf, start, supplementary, homepage, logo } = linking;
  const resourceType = resource?.resource.source.type;
  const [toggled, toggle] = useToggleList();
  const [canCreateLogo, logoActions] = useCreator(resource?.resource, "logo", "ContentResource");
  const [canCreateStart, startActions] = useCreator(resource?.resource, "start", "Canvas", undefined, {
    onlyReference: true,
  });
  const canvasCreatorParent =
    appResource.type === "Manifest"
      ? appResource
      : contextManifestId
        ? { id: contextManifestId, type: "Manifest" }
        : undefined;
  const trackedPartOfItems = partOf.get() || [];
  const parentPartOfItems = useVaultSelector(
    (state) => {
      const ref = toRef(resource?.resource.source);
      const entity = ref ? (state.iiif.entities as any)[ref.type]?.[ref.id] : undefined;
      return entity?.partOf?.map((item: any) => {
        const mappedType =
          item?.id && (state.iiif.entities as any).Manifest?.[item.id]
            ? "Manifest"
            : item?.id && (state.iiif.mapping as any)[item.id]
              ? (state.iiif.mapping as any)[item.id]
              : item?.type;
        const resolved = item?.id && mappedType ? (state.iiif.entities as any)[mappedType]?.[item.id] : undefined;
        return {
          ...item,
          type: mappedType || item?.type,
          label: item?.label || resolved?.label,
          summary: item?.summary || resolved?.summary,
        };
      });
    },
    [resource?.resource.source.id, resource?.resource.source.type]
  );
  const partOfItems = parentPartOfItems || trackedPartOfItems;
  const firstPartOfRef = toRef(partOfItems[0]);
  const partOfLabel =
    partOfItems.length === 1 && firstPartOfRef?.type === "Manifest"
      ? t("ui.sourceManifest")
      : apiLabel(propertyLabels.partOf)!;

  // @todo "service" + "services"
  // @todo "seeAlso" may include manifest types (external)

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("seeAlso") ? (
        <LinkingPropertyList
          containerId={seeAlso.containerId()}
          label={apiLabel(propertyLabels.seeAlso)!}
          property="seeAlso"
          items={seeAlso.get()}
          reorder={(ctx) => seeAlso.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(seeAlso, undefined, t, commonT)}
          creationType="ContentResource"
          emptyLabel={t("ui.noSeeAlso")}
          parent={resource?.resource}
        />
      ) : null}

      {!notAllowed.includes("rendering") ? (
        <LinkingPropertyList
          containerId={rendering.containerId()}
          label={apiLabel(propertyLabels.rendering)!}
          property="rendering"
          items={rendering.get()}
          reorder={(ctx) => rendering.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(rendering, undefined, t, commonT)}
          creationType="ContentResource"
          emptyLabel={t("ui.noRendering")}
          parent={resource?.resource}
        />
      ) : null}

      {!notAllowed.includes("homepage") ? (
        <LinkingPropertyList
          containerId={homepage.containerId()}
          label={apiLabel(propertyLabels.homepage)!}
          property="homepage"
          items={homepage.get()}
          reorder={(ctx) => homepage.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(homepage, undefined, t, commonT)}
          creationType="ContentResource"
          emptyLabel={t("ui.noHomepage")}
          parent={resource?.resource}
        />
      ) : null}

      {!notAllowed.includes("partOf") &&
      (resourceType === "Collection" || resourceType === "Manifest" || resourceType === "Canvas") ? (
        <LinkingPropertyList
          containerId={partOf.containerId()}
          label={partOfLabel}
          property="partOf"
          items={partOfItems}
          reorder={(ctx) => partOf.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(partOf, undefined, t, commonT)}
          creationType={resourceType === "Canvas" ? "Manifest" : "Collection"}
          emptyLabel={t("ui.noPartOf")}
          parent={resource?.resource}
          referenceOnly
          editTab="@manifest-editor/part-of-reference"
          inlineActions={(ref) =>
            ref.id ? (
              <IIIFBrowserFromPartOfButton
                manifestId={ref.id}
                openBrowser={(manifestId) =>
                  canvasCreatorParent &&
                  create({
                    type: "Canvas",
                    parent: canvasCreatorParent,
                    property: "items",
                    isPainting: true,
                    initialCreator: "@manifest-editor/iiif-browser-creator",
                    initialData: {
                      iiifBrowserOptions: {
                        history: {
                          saveToLocalStorage: false,
                          restoreFromLocalStorage: false,
                          initialHistory: [
                            {
                              url: manifestId,
                              resource: manifestId,
                              route: `/loading?id=${manifestId}`,
                              metadata: { type: "Manifest" },
                            },
                          ],
                        },
                      },
                    },
                  })
                }
              />
            ) : null
          }
          initialData={{
            iiifBrowserOptions: {
              navigation: {
                canSelectManifest: resourceType === "Canvas",
                canSelectCollection: resourceType !== "Canvas",
              },
            },
          }}
        />
      ) : null}

      {!notAllowed.includes("supplementary") ? (
        <LinkingPropertyList
          containerId={supplementary.containerId()}
          label={apiLabel(propertyLabels.supplementary)!}
          property="supplementary"
          items={supplementary.get()}
          reorder={(ctx) => supplementary.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(supplementary, undefined, t, commonT)}
          creationType="AnnotationCollection"
          emptyLabel={t("ui.noSupplementary")}
          parent={resource?.resource}
        />
      ) : null}

      {!notAllowed.includes("start") ? (
        <div id={start.containerId()}>
          <InputContainer $wide>
            {start.get() ? (
              <>
                <InputLabel>{apiLabel(propertyLabels.start)!}</InputLabel>
                <CanvasContext canvas={toRef(start.get())?.id as string}>
                  <CanvasListPreview onClick={() => startActions.edit(start.get())} />
                </CanvasContext>
              </>
            ) : (
              <>
                <InputLabel>{apiLabel(propertyLabels.start)!}</InputLabel>
                <EmptyState $noMargin $box>
                  {t("ui.noStartResource")}
                </EmptyState>
              </>
            )}
          </InputContainer>
          <FlexContainer>
            {canCreateStart ? <Button onClick={() => startActions.create()}>{t("ui.setStart")}</Button> : null}
            {start.get() ? <Button onClick={() => start.set(null)}>{t("ui.unsetStart")}</Button> : null}
          </FlexContainer>
        </div>
      ) : null}

      {!notAllowed.includes("logo") ? (
        <div id={logo.containerId()}>
          <InputContainer $wide>
            {!logo.get()?.length ? (
              <>
                <InputLabel>{apiLabel(propertyLabels.logo)!}</InputLabel>
                <EmptyState $noMargin $box>
                  {t("ui.noLogo")}
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                {apiLabel(propertyLabels.logo)!}
                <InputLabelEdit data-active={toggled.logo} onClick={() => toggle("logo")} />
              </InputLabel>
            )}
            <ContentResourceList
              list={logo.get() || []}
              inlineHandle={false}
              reorder={toggled.logo ? (ctx) => logo.reorder(ctx.startIndex, ctx.endIndex) : undefined}
              onSelect={(e, index) => {
                logoActions.edit(e, index);
              }}
              createActions={createAppActions(logo, undefined, t, commonT)}
            />
          </InputContainer>
          {canCreateLogo ? <Button onClick={() => logoActions.create()}>{t("ui.addLogo")}</Button> : null}
        </div>
      ) : null}
    </PaddedSidebarContainer>
  );
}

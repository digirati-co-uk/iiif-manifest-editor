import { ContentResourceList } from "@/_components/ui/ContentResourceList/ContentResourceList";
import { Button } from "@/atoms/Button";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { InputContainer, InputLabel, InputLabelEdit } from "@/editors/Input";
import { AddIcon } from "@/icons/AddIcon";
import { useEditingResource, useEditor } from "@/shell/EditingStack/EditingStack";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { toRef } from "@iiif/parser";
import { useReducer, useState } from "react";
import { createAppActions } from "./LinkingProperties.helpers";
import { useCreator } from "@/_panels/right-panels/BaseCreator/BaseCreator";
import { EmptyState } from "@/madoc/components/EmptyState";

export function useToggleList() {
  const [state, dispatch] = useReducer((prev: any, action: string) => {
    return { ...prev, [action]: !prev[action] };
  }, {});

  return [state, dispatch];
}

export function useCreators() {}

export function LinkingProperties() {
  const resource = useEditingResource();
  const { linking, notAllowed } = useEditor();
  const { seeAlso, service, services, rendering, partOf, start, supplementary, homepage, logo } = linking;
  const [toggled, toggle] = useToggleList();

  // @todo Can this be inside the useEditor? Or Can the supported "type" be in there?
  const [canCreateSeeAlso, seeAlsoActions] = useCreator(resource?.resource, "seeAlso", "ContentResource");
  const [canCreateService, serviceActions] = useCreator(resource?.resource, "service", "Service");
  const [canCreateServices, servicesActions] = useCreator(resource?.resource, "services", "Service");
  const [canCreateRendering, renderingActions] = useCreator(resource?.resource, "rendering", "ContentResource");
  const [canCreatePartOf, partOfActions] = useCreator(resource?.resource, "partOf", "Collection"); // @todo this is wrong...
  const [canCreateStart, startActions] = useCreator(resource?.resource, "start", "Canvas");
  const [canCreateSupplementary, supplementaryActions] = useCreator(
    resource?.resource,
    "supplementary",
    "AnnotationCollection"
  );
  const [canCreateHomepage, homepageActions] = useCreator(resource?.resource, "homepage", "ContentResource");
  const [canCreateLogo, logoActions] = useCreator(resource?.resource, "logo", "ContentResource");

  // @todo "service" + "services"
  // @todo "partOf" using explorer + way to render the properties out.
  // @todo "seeAlso" may include manifest types (external)
  // @todo "start" property

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("seeAlso") ? (
        <>
          <InputContainer wide>
            {!seeAlso.get()?.length ? (
              <>
                <InputLabel>See also</InputLabel>
                <EmptyState $noMargin $box>
                  No see also
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                See also
                <InputLabelEdit data-active={toggled.seeAlso} onClick={() => toggle("seeAlso")} />
              </InputLabel>
            )}
            <ContentResourceList
              list={seeAlso.get() || []}
              inlineHandle={false}
              reorder={toggled.seeAlso ? (ctx) => seeAlso.reorder(ctx.startIndex, ctx.endIndex) : undefined}
              onSelect={(e, index) => {
                seeAlsoActions.edit(e, index);
              }}
              createActions={createAppActions(seeAlso)}
            />
          </InputContainer>
          {canCreateSeeAlso ? <Button onClick={() => seeAlsoActions.create()}>Add see also</Button> : null}
        </>
      ) : null}

      {!notAllowed.includes("rendering") ? (
        <>
          <InputContainer wide>
            {!rendering.get()?.length ? (
              <>
                <InputLabel>Rendering</InputLabel>
                <EmptyState $noMargin $box>
                  No rendering
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                Rendering
                <InputLabelEdit data-active={toggled.rendering} onClick={() => toggle("rendering")} />
              </InputLabel>
            )}
            <ContentResourceList
              list={rendering.get() || []}
              inlineHandle={false}
              reorder={toggled.rendering ? (ctx) => rendering.reorder(ctx.startIndex, ctx.endIndex) : undefined}
              onSelect={(e, index) => {
                renderingActions.edit(e, index);
              }}
              createActions={createAppActions(rendering)}
            />
          </InputContainer>
          {canCreateRendering ? <Button onClick={() => renderingActions.create()}>Add rendering</Button> : null}
        </>
      ) : null}

      {!notAllowed.includes("supplementary") ? (
        <>
          <InputContainer wide>
            {!supplementary.get()?.length ? (
              <>
                <InputLabel>Supplementary</InputLabel>
                <EmptyState $noMargin $box>
                  No supplementary
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                Supplementary
                <InputLabelEdit data-active={toggled.supplementary} onClick={() => toggle("supplementary")} />
              </InputLabel>
            )}
            <ContentResourceList
              list={supplementary.get() || []}
              inlineHandle={false}
              reorder={toggled.supplementary ? (ctx) => supplementary.reorder(ctx.startIndex, ctx.endIndex) : undefined}
              onSelect={(e, index) => {
                supplementaryActions.edit(e, index);
              }}
              createActions={createAppActions(supplementary)}
            />
          </InputContainer>
          {canCreateSupplementary ? (
            <Button onClick={() => supplementaryActions.create()}>Add supplementary</Button>
          ) : null}
        </>
      ) : null}

      {!notAllowed.includes("logo") ? (
        <>
          <InputContainer wide>
            {!logo.get()?.length ? (
              <>
                <InputLabel>Logo</InputLabel>
                <EmptyState $noMargin $box>
                  No logo
                </EmptyState>
              </>
            ) : (
              <InputLabel>
                logo
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
              createActions={createAppActions(logo)}
            />
          </InputContainer>
          {canCreateLogo ? <Button onClick={() => logoActions.create()}>Add logo</Button> : null}
        </>
      ) : null}
    </PaddedSidebarContainer>
  );
}

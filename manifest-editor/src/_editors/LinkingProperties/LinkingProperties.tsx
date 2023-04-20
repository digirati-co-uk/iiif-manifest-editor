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
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { AppDropdownItem } from "@/_components/ui/AppDropdown/AppDropdown";
import { LinkingPropertyList } from "@/_components/ui/LinkingPropertyList/LinkingPropertyList";

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
        <LinkingPropertyList
          label="See also"
          property="seeAlso"
          items={seeAlso.get()}
          reorder={(ctx) => seeAlso.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(seeAlso)}
          creationType="ContentResource"
          emptyLabel="No see also"
          parent={resource?.resource}
        />
      ) : null}

      {!notAllowed.includes("rendering") ? (
        <LinkingPropertyList
          label="Rendering"
          property="rendering"
          items={rendering.get()}
          reorder={(ctx) => rendering.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(rendering)}
          creationType="ContentResource"
          emptyLabel="No rendering"
          parent={resource?.resource}
        />
      ) : null}

      {!notAllowed.includes("supplementary") ? (
        <LinkingPropertyList
          label="Supplementary"
          property="supplementary"
          items={supplementary.get()}
          reorder={(ctx) => supplementary.reorder(ctx.startIndex, ctx.endIndex)}
          createActions={createAppActions(supplementary)}
          creationType="AnnotationCollection"
          emptyLabel="No supplementary"
          parent={resource?.resource}
        />
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

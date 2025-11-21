import { toRef } from "@iiif/parser";
import { PaddedSidebarContainer } from "@manifest-editor/components";
import { useCreator, useEditingResource, useEditor } from "@manifest-editor/shell";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { FlexContainer } from "@manifest-editor/ui/components/layout/FlexContainer";
import { EmptyState } from "@manifest-editor/ui/madoc/components/EmptyState";
import { CanvasContext } from "react-iiif-vault";
import { CanvasListPreview } from "../../components/CanvasListPreview/CanvasListPreview";
import { ContentResourceList } from "../../components/ContentResourceList/ContentResourceList";
import { InputContainer, InputLabel, InputLabelEdit } from "../../components/Input";
import { LinkingPropertyList } from "../../components/LinkingPropertyList/LinkingPropertyList";
import { useToggleList } from "../../helpers";
import { createAppActions } from "../../helpers/create-app-actions";

export function useCreators() {}

export function LinkingProperties() {
  const resource = useEditingResource();
  const { linking, notAllowed } = useEditor();
  const { seeAlso, service, services, rendering, partOf, start, supplementary, homepage, logo } = linking;
  const [toggled, toggle] = useToggleList();
  const [canCreateLogo, logoActions] = useCreator(resource?.resource, "logo", "ContentResource");
  const [canCreateStart, startActions] = useCreator(resource?.resource, "start", "Canvas", undefined, {
    onlyReference: true,
  });

  // @todo "service" + "services"
  // @todo "partOf" using explorer + way to render the properties out.
  // @todo "seeAlso" may include manifest types (external)

  return (
    <PaddedSidebarContainer>
      {!notAllowed.includes("seeAlso") ? (
        <LinkingPropertyList
          containerId={seeAlso.containerId()}
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
          containerId={rendering.containerId()}
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
          containerId={supplementary.containerId()}
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

      {!notAllowed.includes("start") ? (
        <div id={start.containerId()}>
          <InputContainer $wide>
            {start.get() ? (
              <>
                <InputLabel>Start</InputLabel>
                <CanvasContext canvas={toRef(start.get())?.id as string}>
                  <CanvasListPreview onClick={() => startActions.edit(start.get())} />
                </CanvasContext>
              </>
            ) : (
              <>
                <InputLabel>Start</InputLabel>
                <EmptyState $noMargin $box>
                  No start resource
                </EmptyState>
              </>
            )}
          </InputContainer>
          <FlexContainer>
            {canCreateStart ? <Button onClick={() => startActions.create()}>Set start</Button> : null}
            {start.get() ? <Button onClick={() => start.set(null)}>Unset start</Button> : null}
          </FlexContainer>
        </div>
      ) : null}

      {!notAllowed.includes("logo") ? (
        <div id={logo.containerId()}>
          <InputContainer $wide>
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
        </div>
      ) : null}
    </PaddedSidebarContainer>
  );
}

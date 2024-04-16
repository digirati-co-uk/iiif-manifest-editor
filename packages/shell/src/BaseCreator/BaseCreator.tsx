import { CreatorDefinition, CreatorOptions } from "@manifest-editor/creator-api";
import { memo, Suspense, useMemo, useState } from "react";
import { useVault } from "react-iiif-vault";
import { ListingGrid, Item, ItemIcon, ItemLabel, ItemSummary } from "./BaseCreator.module.css";
import { PaddedSidebarContainer } from "@manifest-editor/ui/atoms/PaddedSidebarContainer";
import { toRef } from "@iiif/parser";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { Spinner } from "@manifest-editor/ui/madoc/components/icons/Spinner";
import { useTemporaryHighlight } from "../highlighted-image-resources";
import { CreatableResource } from "../EditingStack/EditingStack.types";
import { useLayoutActions } from "../Layout/Layout.context";
import { useSetCustomTitle } from "../Layout/components/ModularPanel";
import { matchBasedOnResource, useInlineCreator } from "./BaseCreator.hooks";
import { useApp } from "../AppContext/AppContext";

interface BaseCreatorProps {
  resource: CreatableResource;
}

export const RenderCreator = memo(function RenderCreator(props: {
  resource: CreatableResource;
  creator: CreatorDefinition;
}) {
  const vault = useVault();
  const { edit, rightPanel } = useLayoutActions();
  const [isCreating, setIsCreating] = useState(false);
  const creator = useInlineCreator();

  const canvasSelector = props.resource.initialData?.selector;
  useTemporaryHighlight(canvasSelector);

  const options: CreatorOptions = {
    targetType: props.resource.type,
    parent: props.resource.parent
      ? {
          property: props.resource.property as string,
          atIndex: props.resource.index,
          resource: props.resource.parent,
        }
      : undefined,
    target: props.resource.target,
    initialData: props.resource.initialData,
  };

  const runCreate = async (payload: any) => {
    setIsCreating(true);
    creator.create(props.creator.id, payload, options).then((ref) => {
      rightPanel.popStack();
      edit(ref, {
        parent: toRef(props.resource.parent),
        property: props.resource.property,
        index: props.resource.index,
      });
    });
  };

  const validate = async () => {
    return true;
  };

  if (isCreating) {
    return <div>Creating...</div>;
  }

  if (!props.creator.render) {
    return (
      <div>
        <Button onClick={() => runCreate({})}>Create</Button>
      </div>
    );
  }

  return (
    <>
      <Suspense fallback={<Spinner />}>
        {props.creator.render({
          vault,
          runCreate,
          validate,
          options,
        })}
      </Suspense>
    </>
  );
});

export function BaseCreator(props: BaseCreatorProps) {
  const app = useApp();
  const vault = useVault();
  const [currentId, setCurrentId] = useState("");
  const set = useSetCustomTitle();
  const supported = useMemo(
    () => matchBasedOnResource(props.resource, app.layout.creators || [], { vault }),
    [props.resource, app.layout.creators, vault]
  );
  if (supported.length === 1 && !currentId) {
    setCurrentId(supported[0]!.id);
  }

  const current = supported.find((t) => t.id === currentId);

  if (supported.length === 0) {
    return <div>Not currently supported</div>;
  }

  if (current) {
    set(current.label);

    return <RenderCreator creator={current} resource={props.resource} />;
  }

  return (
    <PaddedSidebarContainer>
      {props.resource?.initialData?.selector ? <div>Annotation selection saved.</div> : null}
      <div className={ListingGrid}>
        {supported.map((item) => (
          <div
            className={Item}
            onClick={() => setCurrentId(item.id)}
            data-creator-id={item.id}
            data-creator-type={props.resource.type}
          >
            <div className={ItemIcon}>{item.icon || "no icon"}</div>
            <div className={ItemLabel}>{item.label}</div>
            {item.summary ? <div className={ItemSummary}>{item.summary}</div> : null}
          </div>
        ))}
      </div>
    </PaddedSidebarContainer>
  );
}

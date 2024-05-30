import { CreatorDefinition, CreatorOptions } from "@manifest-editor/creator-api";
import { memo, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useVault } from "react-iiif-vault";
import { toRef } from "@iiif/parser";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { Spinner } from "@manifest-editor/ui/madoc/components/icons/Spinner";
import { useTemporaryHighlight } from "../highlighted-image-resources";
import { CreatableResource } from "../EditingStack/EditingStack.types";
import { useLayoutActions } from "../Layout/Layout.context";
import { useSetCustomTitle } from "../Layout/components/ModularPanel";
import { matchBasedOnResource, useInlineCreator } from "./BaseCreator.hooks";
import { useApp } from "../AppContext/AppContext";
import { CreatorGrid } from "@manifest-editor/components";

interface BaseCreatorProps {
  resource: CreatableResource;
}

export const RenderCreator = memo(function RenderCreator(props: {
  resource: CreatableResource;
  creator: CreatorDefinition;
}) {
  const vault = useVault();
  const { edit, modal } = useLayoutActions();
  const [isCreating, setIsCreating] = useState(false);
  const creator = useInlineCreator();
  const isCreatingRef = useRef(false);

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

  const runCreate = (payload: any) => {
    if (isCreating || isCreatingRef.current) return;
    setIsCreating(true);
    isCreatingRef.current = true;
    creator.create(props.creator.id, payload, options).then((ref) => {
      modal.popStack();
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

  useEffect(() => {
    if (!props.creator.render && !isCreating) {
      runCreate({});
    }
  }, [props.creator]);

  useEffect(() => {
    if (isCreating) {
      modal.popStack();
      modal.close();
    }
  });

  if (isCreating) {
    return null;
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

  useEffect(() => {
    if (current) {
      set && set(current.label);
    }
  });

  if (supported.length === 0) {
    return <div>Not currently supported</div>;
  }

  if (current) {
    return (
      <div>
        <div className="bg-me-gray-100 p-2">
          <Button onClick={() => setCurrentId("")}>Back</Button>
        </div>
        <div className="p-2 py-6">
          <RenderCreator creator={current} resource={props.resource} />
        </div>
      </div>
    );
  }

  return (
    <CreatorGrid
      label="Select a type"
      items={supported.map((item) => ({
        id: item.id,
        title: item.label,
        description: item.summary || "",
        icon: item.icon,
        onClick: () => setCurrentId(item.id),
      }))}
    />
  );
}

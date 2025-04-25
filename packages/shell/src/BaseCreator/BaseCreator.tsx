import { toRef } from "@iiif/parser";
import {
  BackIcon,
  CreatorGrid,
  ErrorMessage,
  GridIcon,
  IconButton,
  ModalBackSlot,
  Spinner,
} from "@manifest-editor/components";
import {
  type CreatableResource,
  type CreatorDefinition,
  type CreatorOptions,
  matchBasedOnResource,
} from "@manifest-editor/creator-api";
import { Button } from "@manifest-editor/ui/atoms/Button";
import { Suspense, memo, useEffect, useMemo, useRef, useState } from "react";
import { useVault } from "react-iiif-vault";
import { useApp } from "../AppContext/AppContext";
import { useLayoutActions } from "../Layout/Layout.context";
import { ModulePanelButton, useSetCustomTitle } from "../Layout/components/ModularPanel";
import { useTemporaryHighlight } from "../highlighted-image-resources";
import { useInlineCreator } from "./BaseCreator.hooks";

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
  const [error, setError] = useState<string | null>(null);
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
    try {
      if (isCreating || isCreatingRef.current) return;
      setIsCreating(true);
      isCreatingRef.current = true;
      creator
        .create(props.creator.id, payload, options)
        .catch((err) => {
          setError(err?.message || "Unknown error");
          return null;
        })
        .then(async (ref) => {
          if (!ref) return;
          const singleRef = Array.isArray(ref) ? ref[0] : ref;
          setIsCreating(false);
          modal.popStack();
          modal.close();
          // Ref might be an array?
          if (singleRef) {
            edit(singleRef!, {
              parent: toRef(props.resource.parent),
              property: props.resource.property,
              index: props.resource.index,
            });
          }
        });
    } catch (err: any) {
      setError(err?.message || "Unknown error");
    }
  };

  const validate = async () => {
    return true;
  };

  useEffect(() => {
    if (!props.creator.render && !isCreating) {
      runCreate({});
    }
  }, [props.creator]);

  if (error) {
    return (
      <div className="flex flex-col items-center p-4">
        <ErrorMessage>{error}</ErrorMessage>
      </div>
    );
  }

  const spinner = (
    <div className="flex flex-col items-center py-8">
      <div className="flex gap-2 items-center">
        <Spinner /> <span>Loading</span>
      </div>
    </div>
  );

  if (isCreating) {
    return spinner;
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
      <Suspense fallback={spinner}>
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
  const [currentId, setCurrentId] = useState(props.resource.initialCreator || "");
  const set = useSetCustomTitle();
  const supported = useMemo(
    () =>
      matchBasedOnResource(props.resource, app.layout.creators || [], {
        vault,
      }),
    [props.resource, app.layout.creators, vault],
  );
  if (supported.length === 1 && !currentId) {
    setCurrentId(supported[0]!.id);
  }

  const current = supported.find((t) => t.id === currentId);

  useEffect(() => {
    if (current) {
      set?.(current.label);
    }
  });

  if (supported.length === 0) {
    return <div>Not currently supported</div>;
  }

  const backButton = (
    <ModalBackSlot>
      <IconButton
        root={document.getElementById("headlessui-portal-root") || undefined}
        label="Back to Add content options"
        className="group"
        placement="right"
        onPress={() => setCurrentId("")}
      >
        <GridIcon className="text-2xl opacity-50 group-hover:opacity-70" />
      </IconButton>
    </ModalBackSlot>
  );

  if (current) {
    const shouldHideModal = current.hiddenModal;

    if (shouldHideModal) {
      return (
        <>
          {backButton}
          <RenderCreator creator={current} resource={props.resource} />
        </>
      );
    }

    return (
      <div>
        {backButton}
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

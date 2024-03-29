import { CreatorDefinition, CreatorOptions } from "@/creator-api/types";
import { useApps } from "@/shell/AppContext/AppContext";
import { CreatableResource } from "@/shell/EditingStack/EditingStack.types";
import { useSetCustomTitle } from "@/shell/Layout/components/ModularPanel";
import { Vault } from "@iiif/helpers/vault";
import { memo, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useVault } from "react-iiif-vault";
import { baseCreatorStyles as $ } from "./BaseCreator.styles";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { Creator } from "@/creator-api";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { toRef } from "@iiif/parser";
import { Button } from "@/atoms/Button";
import { Reference } from "@iiif/presentation-3";
import { useTemporaryHighlight } from "@/state/highlighted-image-resources";
import { Spinner } from "@/madoc/components/icons/Spinner";
import { usePreviewVault } from "@/shell/PreviewVault/PreviewVault";
import { createActionIdentity } from "@/helpers/action-identities";

interface BaseCreatorProps {
  resource: CreatableResource;
}

export function matchBasedOnResource(
  resource: CreatableResource,
  list: CreatorDefinition[],
  options: { vault: Vault }
): CreatorDefinition[] {
  const supported = [];
  if (list.length === 0) {
    return [];
  }
  const parent = toRef(resource.parent);
  const property = resource.property;

  for (const def of list) {
    if (parent && property) {
      if (def.supports.parentTypes) {
        if (!def.supports.parentTypes.includes(parent.type)) {
          continue;
        }
      }
      if (def.supports.parentFields) {
        if (!def.supports.parentFields.includes(property)) {
          continue;
        }
      }

      if (def.supports.parentFieldMap) {
        const type = def.supports.parentFieldMap[parent.type];
        if (!type || !type.includes(property)) {
          continue;
        }
      }

      if (def.supports.disallowPainting && resource.isPainting) {
        continue;
      }

      if (def.supports.custom) {
        const isValid = def.supports.custom({ property, resource: parent, atIndex: resource.index }, options.vault);
        if (!isValid) {
          continue;
        }
      }

      if (!def.supports.initialData && Object.keys(resource.initialData || {}).length !== 0) {
        continue;
      }

      if (def.resourceType !== resource.type) {
        if (!(def.additionalTypes || []).includes(resource.type)) {
          continue;
        }
      }
      supported.push(def);
    }
  }

  return supported;
}

export function useCreator(
  parent: any,
  property: string,
  type: string,
  target?: Reference,
  options?: { isPainting?: boolean; onlyReference?: boolean }
) {
  const vault = useVault();
  const { apps, currentApp } = useApps();
  const { create, edit } = useLayoutActions();
  const selectedApp = currentApp ? apps[currentApp.id] : null;
  const supported = useMemo(
    () => matchBasedOnResource({ type, parent, index: 0, property }, selectedApp?.layout.creators || [], { vault }),
    [parent, property, selectedApp?.layout.creators, type, vault]
  );
  const canCreate = parent && supported.length !== 0;

  const wrappedCreate = useCallback(
    (index?: number, initialData?: any) => {
      if (parent) {
        create({ type, parent: toRef(parent), property, index, target, initialData, ...(options || {}) });
      }
    },
    [create, parent, property, type]
  );

  const wrappedEdit = useCallback(
    (resource: any, index?: number) => {
      edit(resource, parent ? { parent: toRef(parent), property, index } : undefined);
    },
    [edit, parent, property]
  );

  const buttonProps = useMemo(() => {
    return {
      "data-action-id": createActionIdentity(type, property, parent),
    };
  }, []);

  return [canCreate, { create: wrappedCreate, edit: wrappedEdit, buttonProps }] as const;
}

export function useInlineCreator() {
  const vault = useVault();
  const previewVault = usePreviewVault();
  const { apps, currentApp } = useApps();
  const selectedApp = currentApp ? apps[currentApp.id] : null;
  return useMemo(() => {
    return new Creator(vault, selectedApp?.layout.creators || [], previewVault);
  }, [selectedApp?.layout.creators, vault]);
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
  const { apps, currentApp } = useApps();
  const selectedApp = currentApp ? apps[currentApp.id] : null;
  const vault = useVault();
  const [currentId, setCurrentId] = useState("");
  const set = useSetCustomTitle();
  const supported = useMemo(
    () => matchBasedOnResource(props.resource, selectedApp?.layout.creators || [], { vault }),
    [props.resource, selectedApp?.layout.creators, vault]
  );
  if (supported.length === 1 && !currentId) {
    setCurrentId(supported[0].id);
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
      <div className={$.ListingGrid}>
        {supported.map((item) => (
          <div
            className={$.Item}
            onClick={() => setCurrentId(item.id)}
            data-creator-id={item.id}
            data-creator-type={props.resource.type}
          >
            <div className={$.ItemIcon}>{item.icon || "no icon"}</div>
            <div className={$.ItemLabel}>{item.label}</div>
            {item.summary ? <div className={$.ItemSummary}>{item.summary}</div> : null}
          </div>
        ))}
      </div>
    </PaddedSidebarContainer>
  );
}

import { CreatorDefinition, CreatorOptions } from "@/creator-api/types";
import { useApps } from "@/shell/AppContext/AppContext";
import { CreatableResource } from "@/shell/EditingStack/EditingStack.types";
import { useSetCustomTitle } from "@/shell/Layout/components/ModularPanel";
import { Vault } from "@iiif/vault/*";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useVault } from "react-iiif-vault";
import { baseCreatorStyles as $ } from "./BaseCreator.styles";
import { PaddedSidebarContainer } from "@/atoms/PaddedSidebarContainer";
import { Creator } from "@/creator-api";
import { useLayoutActions } from "@/shell/Layout/Layout.context";
import { toRef } from "@iiif/parser";

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
      if (def.supports.custom) {
        const isValid = def.supports.custom({ property, resource: parent, atIndex: resource.index }, options.vault);
        if (!isValid) {
          continue;
        }
      }

      if (def.resourceType !== resource.type) {
        if (!(def.additionalTypes || []).includes(resource.type)) {
          continue;
        }
      }
      supported.push(def);
    }
  }

  console.log(property, supported);
  return supported;
}

export function useCreator(parent: any, property: string, type: string) {
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
    (index?: number) => {
      if (parent) {
        create({ type, parent: toRef(parent), property, index });
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

  return [canCreate, { create: wrappedCreate, edit: wrappedEdit }] as const;
}

export function RenderCreator(props: { resource: CreatableResource; creator: CreatorDefinition }) {
  const vault = useVault();
  const { apps, currentApp } = useApps();
  const { edit, rightPanel } = useLayoutActions();
  const selectedApp = currentApp ? apps[currentApp.id] : null;
  const [isCreating, setIsCreating] = useState(false);
  const creator = useMemo(() => {
    return new Creator(vault, selectedApp?.layout.creators || []);
  }, [selectedApp?.layout.creators, vault]);

  const options = {
    targetType: props.resource.type,
    parent: props.resource.parent
      ? {
          property: props.resource.property as string,
          atIndex: props.resource.index,
          resource: props.resource.parent,
        }
      : undefined,
  };

  const runCreate = async (payload: any) => {
    setIsCreating(true);
    creator.create(props.creator.id, payload, options).then((ref) => {
      rightPanel.popStack();
      edit(ref);
    });
  };

  const validate = async () => {
    console.log("Run validate");
    return true;
  };

  if (isCreating) {
    return <div>Creating...</div>;
  }

  return (
    <>
      {props.creator.render({
        vault,
        runCreate,
        validate,
        options,
      })}
    </>
  );
}

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
      <div className={$.ListingGrid}>
        {supported.map((item) => (
          <div className={$.Item} onClick={() => setCurrentId(item.id)}>
            <div className={$.ItemIcon}>{item.icon || "no icon"}</div>
            <div className={$.ItemLabel}>{item.label}</div>
            {item.summary ? <div className={$.ItemSummary}>{item.summary}</div> : null}
          </div>
        ))}
      </div>
    </PaddedSidebarContainer>
  );
}

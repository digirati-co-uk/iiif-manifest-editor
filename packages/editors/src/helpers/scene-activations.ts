import { getValue } from "@iiif/helpers";
import { createSceneHelper } from "@iiif/helpers/scenes";
import type { Vault4 } from "@iiif/helpers/vault-4";
import { entityActions } from "@iiif/helpers/vault/actions";
import type { Reference } from "@iiif/parser/presentation-4/types";
import { describeSceneAnnotation, isActivatingAnnotation } from "./scene-items";
import type { ModelTransform } from "./model-transforms";

export type SceneActivationState = {
  id: string;
  ref: Reference;
  source: Reference<"Annotation">;
  actions: string[];
  transforms: ModelTransform[];
  selectors: any[];
  label: string;
  changed: boolean;
};

export type SceneActivation = {
  id: string;
  annotation: any;
  page: any;
  pageIndex: number;
  target: any;
  label: string;
  body: any;
  states: SceneActivationState[];
};

export type SceneModel = {
  annotation: any;
  label: string;
  restActions: string[];
};

const asArray = <T>(value: T | readonly T[] | null | undefined): T[] =>
  value == null ? [] : Array.isArray(value) ? [...value] : [value as T];

function resolve(vault: Vault4, value: any, parent?: any, preserveSpecificResources = false) {
  return value
    ? vault.get<any>(value, {
        ...(parent ? { parent } : {}),
        preserveSpecificResources,
        skipSelfReturn: false,
      }) || value
    : undefined;
}

export function getSceneModels(sceneRef: Reference<"Scene">, vault: Vault4): SceneModel[] {
  return createSceneHelper(vault)
    .getPaintables(resolve(vault, sceneRef))
    .items.filter((paintable) => paintable.rawType === "Model")
    .map((paintable, index) => ({
      annotation: paintable.annotation,
      label: describeSceneAnnotation(paintable.annotation, vault, index).label,
      restActions: [paintable.behavior.includes("hidden") ? "hide" : "show"].concat(
        paintable.behavior.includes("disabled") ? "disable" : "enable"
      ),
    }));
}

export function getSceneActivations(sceneRef: Reference<"Scene">, vault: Vault4): SceneActivation[] {
  const scene = resolve(vault, sceneRef);
  const pages = asArray(scene?.annotations).map((page) => resolve(vault, page, scene));
  const annotations = pages.flatMap((page) =>
    asArray(page?.items).map((annotation, pageIndex) => ({
      annotation: resolve(vault, annotation, page),
      page,
      pageIndex,
    }))
  );
  const annotationsById = new Map(annotations.map(({ annotation }) => [annotation?.id, annotation]));
  const restStates = new Map(
    createSceneHelper(vault)
      .getPaintables(scene)
      .items.map((paintable) => [
        paintable.annotationId,
        {
          hidden: paintable.behavior.includes("hidden"),
          disabled: paintable.behavior.includes("disabled"),
          label: describeSceneAnnotation(paintable.annotation, vault).label,
        },
      ])
  );

  return annotations
    .filter(({ annotation }) => isActivatingAnnotation(annotation))
    .map(({ annotation, page, pageIndex }, activationIndex) => {
      const targetRef = asArray(annotation.target)[0];
      const target = resolve(vault, targetRef, annotation, true) || annotationsById.get(targetRef?.id);
      const bodyRef = asArray(annotation.body)[0];
      const body = resolve(vault, bodyRef, annotation, true);
      const stateRefs = body?.type === "SpecificResource" ? [body] : asArray(body?.items);
      const states = stateRefs.map((stateRef, stateIndex) => {
        const state = resolve(vault, stateRef, body, true);
        const source = state?.source as Reference<"Annotation">;
        const model = source ? resolve(vault, source) : undefined;
        const rest = restStates.get(source?.id);
        return {
          id: state.id,
          ref: { id: state.id, type: "ContentResource" },
          source,
          actions: asArray<string>(state.action),
          transforms: asArray<ModelTransform>(state.transform),
          selectors: asArray(state.selector),
          label:
            rest?.label ||
            (model ? describeSceneAnnotation(model, vault, stateIndex).label : `Model ${stateIndex + 1}`),
          changed: activationStateDiffersFromRest(state, rest),
        };
      });
      return {
        id: annotation.id,
        annotation,
        page,
        pageIndex,
        target,
        label: getValue(target?.label) || getValue(annotation.label) || `Activation ${activationIndex + 1}`,
        body,
        states,
      };
    });
}

export function activationStateDiffersFromRest(state: any, rest: { hidden?: boolean; disabled?: boolean } = {}) {
  const actions = asArray<string>(state?.action);
  const visibility = actions.filter((action) => action === "show" || action === "hide").at(-1);
  if (visibility && (visibility === "hide") !== !!rest.hidden) return true;
  const availability = actions.filter((action) => action === "enable" || action === "disable").at(-1);
  if (availability && (availability === "disable") !== !!rest.disabled) return true;
  const playback = actions.filter((action) => action === "start" || action === "stop").at(-1);
  if (playback === "start" || actions.includes("select")) return true;
  if (
    actions.some(
      (action) => !["show", "hide", "enable", "disable", "start", "stop", "reset", "select"].includes(action)
    )
  ) {
    return true;
  }
  if (actions.includes("reset")) return false;
  return asArray<ModelTransform>(state?.transform).some((transform) => {
    if (transform.type === "ScaleTransform") {
      return [transform.x, transform.y, transform.z].some((value) => value !== undefined && Math.abs(value - 1) > 1e-8);
    }
    return [transform.x, transform.y, transform.z].some((value) => Math.abs(value || 0) > 1e-8);
  });
}

function resourceId(parentId: string, type: string) {
  return `${parentId.replace(/\/$/, "")}/${type}/${globalThis.crypto.randomUUID()}`;
}

function activationState(
  activationId: string,
  model: Reference<"Annotation">,
  index: number,
  source?: any,
  restActions: string[] = ["show", "enable"]
) {
  const actions = asArray<string>(source?.actions ?? source?.action);
  return {
    id: resourceId(activationId, `state-${index + 1}`),
    type: "SpecificResource",
    source: model,
    action: actions.length ? actions : restActions,
    selector: asArray(source?.selectors ?? source?.selector),
    transform: asArray(source?.transforms ?? source?.transform),
  };
}

function activationResources(
  sceneId: string,
  label: string,
  models: Reference<"Annotation">[],
  source?: SceneActivation,
  restActions = new Map<string, string[]>()
) {
  const activationId = resourceId(sceneId, "activation");
  const triggerId = `${activationId}/trigger`;
  const trigger = {
    id: triggerId,
    type: "Annotation",
    motivation: ["commenting"],
    target: { id: sceneId, type: "Scene" },
    label: { en: [label] },
    body: {
      id: resourceId(triggerId, "body"),
      type: "TextualBody",
      format: "text/plain",
      value: label,
    },
  };
  const sourceStates = new Map(source?.states.map((state) => [state.source.id, state]) || []);
  const activation = {
    id: activationId,
    type: "Annotation",
    motivation: ["activating"],
    target: { id: triggerId, type: "Annotation" },
    body: {
      id: resourceId(activationId, "body"),
      type: "List",
      items: models.map((model, index) =>
        activationState(activationId, model, index, sourceStates.get(model.id), restActions.get(model.id))
      ),
    },
  };
  return { trigger, activation };
}

function importActivationStates(vault: Vault4, bodyId: string, states: any[], itemRefs = states) {
  if (states.length) {
    vault.dispatch(
      entityActions.importEntities({
        entities: {
          ContentResource: Object.fromEntries(
            states.map((state) => [
              state.id,
              {
                ...state,
                language: [],
                selector: asArray(state.selector),
                transform: asArray(state.transform),
                action: asArray(state.action),
              },
            ])
          ),
        },
      })
    );
  }
  vault.modifyEntityField(
    { id: bodyId, type: "ContentResource" } as any,
    "items",
    itemRefs.map((state: any) => ({ id: state.id, type: "ContentResource" }))
  );
}

function importActivation(vault: Vault4, created: ReturnType<typeof activationResources>) {
  const states = created.activation.body.items;
  vault.loadSync(created.trigger.id, created.trigger as any);
  vault.loadSync(created.activation.id, {
    ...created.activation,
    body: { ...created.activation.body, items: [] },
  } as any);
  importActivationStates(vault, created.activation.body.id, states);
}

function activationPage(sceneRef: Reference<"Scene">, vault: Vault4) {
  const scene = resolve(vault, sceneRef);
  const pages = asArray(scene?.annotations).map((page) => resolve(vault, page, scene));
  const existing = pages.find((page) =>
    asArray(page?.items).some((item) => isActivatingAnnotation(resolve(vault, item, page)))
  );
  if (existing) return existing;

  const page = {
    id: resourceId(sceneRef.id, "activations"),
    type: "AnnotationPage",
    label: { en: ["Scene activations"] },
    items: [],
  };
  vault.loadSync(page.id, page as any);
  vault.modifyEntityField(sceneRef as any, "annotations", [
    ...asArray(scene?.annotations),
    { id: page.id, type: page.type },
  ]);
  return resolve(vault, { id: page.id, type: page.type });
}

export function createSceneActivation(
  sceneRef: Reference<"Scene">,
  label: string,
  models: Reference<"Annotation">[],
  vault: Vault4
) {
  const page = activationPage(sceneRef, vault);
  const restActions = new Map(getSceneModels(sceneRef, vault).map((model) => [model.annotation.id, model.restActions]));
  const created = activationResources(sceneRef.id, label, models, undefined, restActions);
  importActivation(vault, created);
  vault.modifyEntityField(page as any, "items", [
    ...asArray(page.items),
    { id: created.trigger.id, type: "Annotation" },
    { id: created.activation.id, type: "Annotation" },
  ]);
  return created.activation.id;
}

export function duplicateSceneActivation(sceneRef: Reference<"Scene">, source: SceneActivation, vault: Vault4) {
  const label = `Copy of ${source.label}`;
  const models = source.states.map((state) => state.source);
  const created = activationResources(sceneRef.id, label, models, source);
  const sourceBody = vault.toPresentation4<any>({ id: source.body.id, type: "ContentResource" });
  const sourceItems = sourceBody.type === "List" ? asArray(sourceBody.items) : [sourceBody];
  created.activation.body = {
    ...(sourceBody.type === "List" ? sourceBody : {}),
    id: resourceId(created.activation.id, "body"),
    type: "List",
    items: sourceItems.map((item, index) => ({
      ...item,
      id: resourceId(created.activation.id, `state-${index + 1}`),
    })),
  } as any;
  const page = resolve(vault, { id: source.page.id, type: "AnnotationPage" });
  const items = asArray(page.items);
  const insertAt = items.findIndex((item: any) => item.id === source.id) + 1;
  const next = [...items];
  next.splice(
    insertAt,
    0,
    { id: created.trigger.id, type: "Annotation" },
    { id: created.activation.id, type: "Annotation" }
  );
  importActivation(vault, created);
  vault.modifyEntityField({ id: page.id, type: "AnnotationPage" } as any, "items", next);
  return created.activation.id;
}

export function removeSceneActivation(sceneRef: Reference<"Scene">, activation: SceneActivation, vault: Vault4) {
  const targetId = asArray(activation.annotation.target)[0]?.id;
  const page = resolve(vault, { id: activation.page.id, type: "AnnotationPage" });
  const ownedTarget = targetId === `${activation.id}/trigger`;
  const otherUsesTarget = getSceneActivations(sceneRef, vault).some(
    (candidate) => candidate.id !== activation.id && asArray(candidate.annotation.target)[0]?.id === targetId
  );
  vault.modifyEntityField(
    { id: page.id, type: "AnnotationPage" } as any,
    "items",
    asArray(page.items).filter(
      (item: any) => item.id !== activation.id && (!ownedTarget || otherUsesTarget || item.id !== targetId)
    )
  );
}

function ensureActivationList(activation: SceneActivation, vault: Vault4) {
  if (activation.body.type === "List") return activation.body;
  const list = {
    id: resourceId(activation.id, "body"),
    type: "List",
    items: [],
  };
  vault.loadSync(list.id, list as any);
  vault.modifyEntityField({ id: list.id, type: "ContentResource" } as any, "items", [activation.states[0]!.ref]);
  vault.modifyEntityField({ id: activation.id, type: "Annotation" } as any, "body", [
    { id: list.id, type: "ContentResource" },
  ]);
  return resolve(vault, { id: list.id, type: "ContentResource" });
}

export function addModelsToSceneActivation(
  sceneRef: Reference<"Scene">,
  activation: SceneActivation,
  models: Reference<"Annotation">[],
  vault: Vault4
) {
  const existing = new Set(activation.states.map((state) => state.source.id));
  const additions = models.filter((model) => !existing.has(model.id));
  if (!additions.length) return;
  const body = ensureActivationList(activation, vault);
  const items = asArray(body.items);
  const restActions = new Map(getSceneModels(sceneRef, vault).map((model) => [model.annotation.id, model.restActions]));
  const newStates = additions.map((model, index) =>
    activationState(activation.id, model, items.length + index, undefined, restActions.get(model.id))
  );
  importActivationStates(vault, body.id, newStates, [...items, ...newStates]);
}

export function removeActivationState(activation: SceneActivation, stateId: string, vault: Vault4) {
  if (activation.states.length <= 1 || activation.body.type !== "List") return false;
  vault.modifyEntityField(
    { id: activation.body.id, type: "ContentResource" } as any,
    "items",
    asArray(activation.body.items).filter((item: any) => item.id !== stateId)
  );
  return true;
}

export function reorderActivationStates(
  activation: SceneActivation,
  startIndex: number,
  endIndex: number,
  vault: Vault4
) {
  if (activation.body.type !== "List") return false;
  const items = move(asArray(activation.body.items), startIndex, endIndex);
  vault.modifyEntityField({ id: activation.body.id, type: "ContentResource" } as any, "items", items);
  return true;
}

export function reorderSceneActivations(
  activations: SceneActivation[],
  startIndex: number,
  endIndex: number,
  vault: Vault4
) {
  if (!activations[startIndex] || !activations[endIndex]) return false;
  const reordered = move(
    activations.map((activation) => ({ id: activation.id, type: "Annotation" })),
    startIndex,
    endIndex
  );
  let nextIndex = 0;
  const pageIds = [...new Set(activations.map((activation) => activation.page.id))];
  for (const pageId of pageIds) {
    const page = resolve(vault, { id: pageId, type: "AnnotationPage" });
    const items = asArray<any>(page.items).map((item) => {
      const annotation = resolve(vault, item, page);
      return isActivatingAnnotation(annotation) ? reordered[nextIndex++]! : item;
    });
    vault.modifyEntityField({ id: page.id, type: "AnnotationPage" } as any, "items", items);
  }
  return true;
}

function move<T>(items: T[], startIndex: number, endIndex: number) {
  const next = [...items];
  const [item] = next.splice(startIndex, 1);
  if (item !== undefined) next.splice(endIndex, 0, item);
  return next;
}

export function findActivationState(activation: SceneActivation | undefined, annotationId: string | null) {
  return activation?.states.find((state) => state.source.id === annotationId);
}

export function setActivationStateTransforms(state: SceneActivationState, transforms: ModelTransform[], vault: Vault4) {
  vault.modifyEntityField(state.ref as any, "transform", transforms);
}

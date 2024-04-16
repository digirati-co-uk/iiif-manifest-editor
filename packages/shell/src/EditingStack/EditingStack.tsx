import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { EditableResource, EditingStackActions, EditingStackState } from "./EditingStack.types";
import { editingStackReducer } from "./EditingStack.reducer";
import { EditorInstance } from "@manifest-editor/editor-api";
import invariant from "tiny-invariant";
import { useResourceContext, useVault } from "react-iiif-vault";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { toRef } from "@iiif/parser";
import { flushSync } from "react-dom";
import { useAppInstance } from "../AppContext/AppContext";

const defaultState: EditingStackState = { stack: [], current: null, create: null };
const EditingStackContext = createContext<EditingStackState>(defaultState);
const EditingStackActionsContext = createContext<EditingStackActions>({
  edit() {},
  close() {},
  back() {},
  updateCurrent() {},
  create() {
    return () => {};
  },
});

export function useEditingStack() {
  return useContext(EditingStackActionsContext);
}

export function useEditingResource() {
  return useContext(EditingStackContext).current;
}

export function useEditingResourceStack() {
  return useContext(EditingStackContext).stack;
}

export function useCreatingResource() {
  return useContext(EditingStackContext).create;
}

export function useManifestEditor() {
  const { manifest } = useResourceContext();
  const vault = useVault();
  const [key, invalidate] = useReducer((i: number) => i + 1, 0);

  invariant(manifest, "Manifest not found");

  const editor = useMemo(() => {
    return new EditorInstance({
      reference: { id: manifest, type: "Manifest" },
      vault,
    });
  }, [manifest, vault]);

  useEffect(() => {
    return editor.observe.start(invalidate);
  }, [editor]);

  editor.observe.key = `${key}`;
  editor.observe.reset();

  return editor;
}

export function useCollectionEditor() {
  const { collection } = useResourceContext();
  const vault = useVault();
  const [key, invalidate] = useReducer((i: number) => i + 1, 0);

  invariant(collection, "Collection not found");

  const editor = useMemo(() => {
    return new EditorInstance({
      reference: { id: collection, type: "Collection" },
      vault,
    });
  }, [collection, vault]);

  useEffect(() => {
    return editor.observe.start(invalidate);
  }, [editor]);

  editor.observe.key = `${key}`;
  editor.observe.reset();

  return editor;
}

export function useGenericEditor(
  ref: Reference<any> | SpecificResource | undefined,
  ctx: { parent?: Reference; parentProperty?: string; index?: number } = {}
) {
  const vault = useVault();
  const [key, invalidate] = useReducer((i: number) => i + 1, 0);

  invariant(ref, "Resource not found");

  const editor = useMemo(() => {
    return new EditorInstance({
      reference: toRef(ref) as any,
      vault,
      context: { resource: ref, parent: ctx.parent, index: ctx.index, parentProperty: ctx.parentProperty },
    });
  }, [ref, vault]);

  useEffect(() => {
    return editor.observe.start(invalidate);
  }, [editor]);

  editor.observe.key = `${key}`;
  editor.observe.reset();

  return editor;
}

export function useAnnotationPageEditor() {
  const { annotationPage } = useResourceContext();

  invariant(annotationPage, "Annotation page not found");

  return useGenericEditor({ id: annotationPage, type: "AnnotationPage" });
}

export function useEditor() {
  const resource = useEditingResource();
  const vault = useVault();
  const [key, invalidate] = useReducer((i: number) => i + 1, 0);

  invariant(resource, "No resource selected");

  const editor = useMemo(() => {
    return new EditorInstance({
      reference: resource.resource.source || resource.resource,
      vault,
    });
  }, [resource, vault]);

  useEffect(() => {
    return editor.observe.start(invalidate);
  }, [editor]);

  editor.observe.key = `${key}`;
  editor.observe.reset();

  return editor;
}

export function EditingStack(props: { children?: any }) {
  const vault = useVault();
  const [state, _dispatch] = useReducer(editingStackReducer, defaultState);

  const dispatch = useCallback((action: any) => {
    (() => flushSync(() => _dispatch(action)))();
  }, []);

  useEffect(() => {
    return vault.on("@iiif/REMOVE_REFERENCE", (payload: any) => {
      const action = payload.action;
      const parent = { id: action.payload.id, type: action.payload.type };
      const resource = action.payload.reference;
      _dispatch({ type: "syncRemoval", payload: { resource: { parent, resource } } });
    });
  }, [vault]);

  const edit = useCallback(
    (resource: EditableResource, reset = false) => dispatch({ type: "edit", payload: { resource, reset } }),
    []
  );

  const updateCurrent = useCallback(
    (resource: EditableResource) => dispatch({ type: "updateCurrent", payload: { resource } }),
    []
  );

  const close = useCallback(() => dispatch({ type: "close" }), []);

  const back = useCallback(() => dispatch({ type: "back" }), []);

  const create = useCallback<EditingStackActions["create"]>((resource, options) => {
    dispatch({ type: "create", payload: { resource, options } });

    // Returns function when complete.
    return () => {
      dispatch({ type: "create", payload: { resource: null } });
    };
  }, []);

  const actions: EditingStackActions = useMemo(() => {
    return { edit, updateCurrent, close, back, create };
  }, []);

  const { instanceId } = useAppInstance();

  return (
    <EditingStackActionsContext.Provider value={actions} key={instanceId}>
      <EditingStackContext.Provider value={state}>{props.children}</EditingStackContext.Provider>
    </EditingStackActionsContext.Provider>
  );
}

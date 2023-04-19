import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { EditableResource, EditingStackActions, EditingStackState } from "@/shell/EditingStack/EditingStack.types";
import { editingStackReducer } from "@/shell/EditingStack/EditingStack.reducer";
import { EditorInstance } from "@/editor-api/EditorInstance";
import invariant from "tiny-invariant";
import { useManifest, useResourceContext, useVault } from "react-iiif-vault";
import { Reference, SpecificResource } from "@iiif/presentation-3";
import { toRef } from "@iiif/parser";

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

const EditorContext = createContext<EditorInstance<any> | null>(null);

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

export function useGenericEditor(ref: Reference<any> | SpecificResource) {
  const vault = useVault();
  const [key, invalidate] = useReducer((i: number) => i + 1, 0);

  invariant(ref, "Resource not found");

  const editor = useMemo(() => {
    return new EditorInstance({
      reference: toRef(ref) as any,
      vault,
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

export function useCollectionEditor() {
  //
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
  const [state, dispatch] = useReducer(editingStackReducer, defaultState);

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

  return (
    <EditingStackActionsContext.Provider value={actions}>
      <EditingStackContext.Provider value={state}>{props.children}</EditingStackContext.Provider>
    </EditingStackActionsContext.Provider>
  );
}

# ScenePanel editing requirements

> Status: implemented upstream in `react-iiif-vault` commit `74bcbd7` and consumed by the Manifest Editor. The API delivered controlled selection, transform modes and commits, snapping, helpers, framing, view capture, and resource status reporting. The sketch below is retained as the original integration brief.

The Manifest Editor can display Scenes with `ScenePanel` and edit authored transform values in forms. Interactive translate, rotate, and scale handles need a small public editing API in `react-iiif-vault`.

## Required API

Add an optional editing configuration to `ScenePanelProps`:

```ts
type SceneTransformMode = "translate" | "rotate" | "scale";

type SceneTransformChange = {
  annotation: AnnotationNormalized;
  mode: SceneTransformMode;
  translation: [number, number, number];
  rotation: [number, number, number, number]; // quaternion
  scale: [number, number, number];
};

type SceneEditingOptions = {
  enabled: boolean;
  mode: SceneTransformMode;
  selectedAnnotation?: string | null;
  onSelectAnnotation?: (annotation: AnnotationNormalized | null) => void;
  onTransformChange?: (change: SceneTransformChange) => void;
  onTransformCommit?: (change: SceneTransformChange) => void;
};

interface ScenePanelProps {
  editing?: SceneEditingOptions;
}
```

## Behaviour

- Clicking a painted Model selects its painting Annotation.
- The selected Model is wrapped in `TransformControls` using the requested mode.
- Orbit controls are disabled while a transform handle is being dragged.
- `onTransformChange` supplies live values for UI feedback; `onTransformCommit` fires once at the end of a drag so the editor can write one Vault history entry.
- Values are expressed in the Model's authored local coordinate space, after decomposing the existing IIIF transform matrix.
- Changing Vault-authored transforms updates the rendered object without remounting `ScenePanel`.

The built-in Model renderer/loading path should remain in use. A custom `SceneResourceRenderer` is not sufficient today because it would have to duplicate the package's private GLTF loading, animation, bounds, registration, transition, and error-handling code.

## Vault4 hook types

`VaultProvider` and `useExistingVault` accept `Vault4`, but the declarations for `useVault`, `useVaultEffect`, and `useVaultSelector` still expose only the legacy `Vault` type. Make these hooks generic over the active `Vault | Vault4`, preferably with overloads that retain the concrete type. This lets consumers call `toPresentation4` and pass hook results to Presentation 4 APIs without unsafe casts.

Affected source files:

- `src/hooks/useVault.ts`
- `src/hooks/useVaultEffect.ts`
- `src/hooks/useVaultSelector.ts`

# Prompt: ScenePanel editing follow-up

Please make the following `react-iiif-vault/scene-panel` editing fixes for the Manifest Editor.

## Keep the free camera stable while transforming resources

When a Model is translated, rotated, or scaled with `TransformControls`, the orbit camera target currently follows the changing aggregate Scene bounds. This makes a large object move out from under the pointer and is difficult to control.

`InitialSceneBounds` currently calls `syncOrbitTargetToBounds()` whenever `boundsVersion` changes. Use aggregate bounds to establish the initial free view, but do not update the orbit target again after that initial frame. Later camera changes should happen only through an explicit `frameAnnotation()`, `frameAll()`, `setView()`, camera selection, or user navigation. Add a regression test that moves a large Model and verifies that the free camera position and target remain unchanged.

## Orient camera helpers from `lookAt`

An authored Camera can have a position transform and a `lookAt` target without a RotateTransform. The rendered camera correctly resolves and applies `lookAt`, but `CameraEditorHelper` receives the transform quaternion and can therefore draw its cone in a different direction—often straight down or along the default axis.

Make the camera helper use the rendered camera's final world position/quaternion after `lookAt` has resolved. It should update when a referenced target's bounds move. Cover both `PointSelector` and referenced Annotation/Model targets, including a camera with no RotateTransform.

## Optional: editing interaction filters

Expose a simple way for an editor to make resource categories selectable/editable independently, without hiding or disabling the authored resource. For example, extend `SceneEditingOptions` with an `editableTypes` list or a predicate receiving the annotation/resource/path. This would let the Manifest Editor temporarily exclude lights or cameras from pointer selection while still rendering them. Keep `showLightHelpers` and `showCameraHelpers` as separate visual controls.

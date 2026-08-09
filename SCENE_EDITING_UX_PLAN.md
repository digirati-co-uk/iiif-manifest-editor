# Scene editing UX plan

## Goal

Let a user start with an empty IIIF Scene and a model URL, then build a useful scene without needing to understand AnnotationPages, painting Annotations, SpecificResources, transform arrays, or generated IDs.

The editor should make the authored result obvious: what is visible in edit mode, what is merely an editor aid, and what will be present when the Presentation 4 Manifest is opened elsewhere.

The first release should concentrate on the common path:

1. Create a Scene.
2. Add one or more models from URLs.
3. Place and orient the models visually.
4. Add authored lighting.
5. Save one or more useful camera views.
6. Preview the result as a viewer will see it.

## Product principles

- **The viewport is the primary editor.** Selecting and moving objects should happen directly in the scene. Forms are for precision and properties that are not naturally spatial.
- **One selection everywhere.** A selection in the viewport, Scene contents list, or properties sidebar represents the same painting Annotation.
- **Use human names, not IDs.** Generated IDs remain available under Advanced, but are never the main label for a scene item.
- **Useful defaults, explicit authorship.** The free camera, fallback lighting, grid, floor, and helpers are preview aids. They must be visibly distinguished from cameras and lights that will be serialized.
- **Immediate feedback with safe commits.** Dragging a handle updates the viewport live, but creates one history entry when the drag ends. Escape cancels the drag.
- **Progressive disclosure.** A first-time user sees Add model, Move, Lighting, Camera, and Preview. Projection planes, clipping distances, transform order, IDs, and raw values live in Advanced sections.
- **Preserve imported data.** Opening a valid Presentation 4 Scene must not rewrite transforms or add default resources until the user explicitly changes something.

## Workspace layout

Use a familiar editor arrangement rather than putting the whole workflow in a long form.

```text
┌──────────────────────┬────────────────────────────────────┬──────────────────────┐
│ Scene contents       │ Select  Move  Rotate  Scale        │ Properties           │
│                      │ Space: Local   Snap: Off           │                      │
│ Objects              ├────────────────────────────────────┤ Model                │
│  ▣ Astronaut         │                                    │ Name                 │
│  ▣ Display plinth    │            3D viewport             │ Transform            │
│ Cameras              │                                    │ Position  X Y Z       │
│  ◉ Main view         │                                    │ Rotation  X Y Z       │
│ Lights               │                                    │ Scale     X Y Z       │
│  ☀ Key light         │                                    │                      │
│  ◌ Ambient fill      │                                    │ Model URL            │
│                      ├────────────────────────────────────┤ Advanced             │
│ + Add                │ Free view · Perspective · Ready    │                      │
└──────────────────────┴────────────────────────────────────┴──────────────────────┘
```

### Left sidebar: Scene contents

The existing Manifest **Items** panel remains available. When a Scene is opened, add and select a **Scene contents** panel beside it. This preserves navigation back to other Canvases, Timelines, and Scenes while making the current Scene manageable.

The Scene contents panel is a visual outliner grouped into:

- Objects
- Cameras
- Lights
- Audio
- Annotations and other content

Grouping is a presentation aid, not a new IIIF hierarchy. Initially, preserve AnnotationPage order and do not offer drag-to-reparent or group nodes.

Each row should contain:

- a recognisable type icon;
- a human-readable name;
- a short secondary type such as `Model`, `Perspective camera`, or `Spot light`;
- loading, warning, or error status when relevant;
- an overflow menu for Rename, Frame in view, Duplicate, Remove, Copy URL, and Copy ID as applicable.

Resolve the row name in this order:

1. body resource `label`;
2. painting Annotation `label`;
3. filename from a model or environment-map URL, with its extension removed;
4. a stable friendly fallback such as `Model 2`, `Perspective camera 1`, or `Point light 3`.

The full URL and generated ID belong in the properties sidebar's Advanced section. A user should never have to distinguish two rows by scanning UUIDs.

The bottom of the panel has one **Add** button. Its menu contains:

- 3D model from URL
- Camera from current view
- Light
- Audio, when audio creation is supported
- Advanced resource types, later

Selection is synchronized both ways:

- clicking a row selects and outlines the resource in the viewport and opens its properties;
- clicking a rendered object or editor helper selects its row and opens its properties;
- clicking empty space selects the Scene itself;
- deleting the selection returns to the Scene properties rather than closing the editor.

### Centre: scene viewport

The viewport fills the available space. It should not be reduced to make room for instructions or large tool cards.

Its compact toolbar contains:

- Select;
- Move;
- Rotate;
- Scale;
- Local/World coordinate space;
- snap toggle and snap value;
- Frame selection;
- Reset free view;
- Free view/authored camera chooser;
- Edit/Preview mode.

Suggested shortcuts follow common 3D tools and must also be available as labelled buttons:

- `W`: Move
- `E`: Rotate
- `R`: Scale
- `F`: Frame selection
- `Delete`/`Backspace`: Remove, with confirmation when appropriate
- `Escape`: cancel the active drag or clear selection
- `Cmd/Ctrl+Z`: Undo
- `Cmd/Ctrl+Shift+Z`: Redo

Orbiting the free view must never silently change an authored camera. Camera authorship only occurs through **Save current view as camera** or **Update camera from current view**.

Edit mode shows the floor/grid, selection outline, transform handles, light helpers, and camera helpers. Preview mode hides those aids and uses only the authored scene plus normal viewer controls. A small status line identifies `Free view` or the active authored camera.

### Right sidebar: properties

The existing editor sidebar becomes the inspector for the current selection. It should keep a consistent order:

1. name and type;
2. the most important type-specific controls;
3. transform;
4. source or targeting;
5. Advanced.

Do not put the Scene contents list and the selected item's complete form in the same scrolling panel. The list answers “what is here?” and the inspector answers “what is selected?”.

For narrow/focused layouts, show one drawer at a time. Selecting a Scene contents row closes the left drawer, keeps the viewport visible, and makes the properties drawer available from the existing editor control. No separate mobile-only workflow is needed.

## End-to-end user journey

### 1. Create an empty Scene

The Scene creator asks only for a name. Background colour can use a sensible default and remain editable after creation.

After creation, open the new Scene immediately and show an empty viewport with:

- `Add your first 3D model`;
- a URL field;
- an **Add model** button;
- a secondary **Add light or camera instead** action.

This is a real empty state inside the normal workspace, not a separate wizard. As soon as the first item exists, it disappears.

### 2. Add a model URL

When the user pastes a `.glb` or `.gltf` URL:

1. Validate that it is an HTTP(S) URL.
2. Infer the format from the URL when possible. A failed `HEAD` request must not block a URL that the renderer may still load.
3. Create the painting Annotation and show a new row immediately with a loading state.
4. Load the model in the viewport.
5. On success, select and frame it.
6. Offer a suggested name derived from the filename, which the user can replace.

The initial placement is the Scene origin with no authored transform. Auto-framing changes only the free view, not the model. Do not silently rescale an imported model.

Useful one-click placement actions can appear after the model has bounds:

- **Centre at origin**
- **Place on floor**
- **Reset transform**

These actions show the calculated result before committing, or remain undoable as one operation.

If loading fails, retain the scene item and show a precise error beside it: unreachable URL, CORS/network failure, unsupported model, missing external glTF asset, or decoder failure when known. Provide **Retry**, **Change URL**, and **Remove**. Do not replace the whole viewport with a generic scene error when one of several models fails.

### 3. Place and orient models

The newly added model starts selected with the Move tool active. Transform handles use the conventional X/Y/Z colours, plus accessible text and keyboard alternatives.

The user can:

- drag an axis to constrain movement;
- drag a plane handle to move on two axes;
- rotate around one axis;
- scale uniformly by default, with an option to unlink axes;
- toggle local/world space;
- enable position, rotation, or scale snapping;
- type exact values in the right sidebar.

During a drag, the numeric fields update live. The drag is a transient viewport override until pointer-up, when the editor writes one set of IIIF transforms and one undo entry. Escape restores the values from before the drag.

Numeric fields should use plain units:

- Position: Scene units, with the Scene's `spatialScale` shown when available.
- Rotation: degrees.
- Scale: multiplier, with uniform scaling locked by default.

Reset removes the authored transform of that type where possible rather than filling the Manifest with redundant zero/identity transforms.

### 4. Add and place lights

When no authored light exists, `ScenePanel` supplies fallback lights so the model remains visible. Edit mode must call this out unobtrusively:

> Preview lighting is active. Add a light to define how this Scene appears in other viewers.

The **Add light** menu starts with task-oriented choices:

- **Studio lighting** — create a balanced ambient fill and directional key light aimed at the selection or Scene origin.
- **Environment light** — add an image-based light from an environment-map URL.
- **Directional light** — parallel light, useful for sun-like illumination.
- **Point light** — light emitted from one position.
- **Spot light** — a cone aimed at a target.
- **Ambient light** — even fill without a position.

The preset is only a shortcut to normal authored resources; it should not introduce a private scene format.

When adding a positional light, place it in front of and above the selected object based on the current free view. When adding a directional or spot light, target the selected object if possible, otherwise the Scene origin.

Edit mode displays simple, selectable light helpers:

- a point for the light origin;
- an arrow for directional light;
- a cone for spot light;
- the light colour in the helper;
- the target point or target resource.

The right sidebar exposes colour, intensity, position, rotation or target, and spot angle as appropriate. Use a native colour input alongside the text value, a slider for quick intensity adjustment, and a numeric field for exact input. Ambient and image-based lights should not show meaningless position controls.

Include **Aim at selection** and **Move to current view** for relevant light types. Keep shadow controls, photometric profiles, and renderer-specific settings out of the first iteration because they are not part of the current IIIF model.

### 5. Create and control cameras

The viewport always has a **Free view** for scene construction. This is not an authored resource.

The primary camera workflow is:

1. Orbit, pan, and zoom to the desired composition.
2. Choose **Camera from current view**.
3. Name it, defaulting to `Camera 1`.
4. Save it as a PerspectiveCamera with the current position, orientation/look-at target, field of view, and clipping values.
5. Preview the saved camera immediately.

When an authored camera is selected, provide:

- **Look through camera**;
- **Update from current view**;
- **Aim at selection**;
- **Duplicate camera**;
- projection type;
- field of view or orthographic view height;
- near and far clipping distances under Advanced;
- position, rotation, and look-at target.

Camera helpers in edit mode show a selectable camera icon and view frustum. They disappear in Preview mode.

The camera chooser lists `Free view` first, then named authored cameras. Changing the chooser previews a camera but does not change Manifest start behavior unless the user explicitly chooses **Use as starting camera** and Presentation 4 provides an authored representation for that behavior.

### 6. Review and export

Preview mode should behave like a clean `ScenePanel` viewer:

- no grid, helpers, transform handles, selection outline, or editor-only fallback notice;
- authored cameras and controls remain available;
- authored lighting is used;
- loading and resource errors remain visible.

Before export, surface a short Scene quality summary rather than blocking the user:

- resources with loading errors;
- unnamed resources using generated fallback names;
- no authored camera;
- no authored light, meaning viewer fallback lighting may vary;
- invalid near/far camera ranges;
- missing or unreachable source URLs known during the session.

The download action should continue to select Presentation 4 automatically for any Manifest containing a Scene and make that version visible in the export UI.

## Scene contents details

### Visual language

Use quiet, standard list rows with a 1px separator and a clear selected state. Avoid cards for every resource, large decorative icons, status pills, and thumbnails that cannot communicate a useful difference.

Icons should encode resource category rather than file format:

- cube/object: Model
- camera: camera
- sun: directional/ambient light
- bulb: point light
- cone: spot light
- environment/sphere: image-based light
- speaker: audio
- annotation marker: descriptive Annotation

Use tooltips and visible type text so colour and icon shape are not the only distinction.

### Filtering and scale

For the first iteration, grouping and browser text search are enough. Add collapse/expand per group when a Scene has more than a handful of items. Virtualization, nested groups, bulk selection, and complex filters can wait until real scenes demonstrate a need.

### Local visibility

An eye control is useful for temporarily isolating work, but it must be explicitly editor-local unless Presentation 4 visibility is being authored. The tooltip should say `Hide in editor` and Preview mode should reset local visibility. Do not serialize a private `hidden` property.

## State and implementation approach

Keep the coordination local to `SceneEditor` rather than adding another application-wide store. It owns:

- selected painting Annotation ID;
- active tool: select, translate, rotate, or scale;
- local/world space;
- snap settings;
- edit/preview mode;
- editor-local hidden resources;
- the `ScenePanel` handle and latest runtime resource states.

Connect that state to existing systems:

- Scene contents uses the Scene's AnnotationPage items and existing creator/editing-stack actions.
- Selecting an item pushes its painting Annotation into the existing editing stack.
- The right sidebar continues to use registered Model, camera, and light editor definitions.
- Human names use `getValue`, the resolved annotation body, and URL basename logic in one shared helper.
- Vault remains the source of authored values. `ScenePanel` owns only transient interaction state.
- A transform drag uses a renderer override for live feedback and commits to Vault once at drag end.

Do not make the Manifest Editor responsible for loading and rendering a second copy of a glTF model just to add controls. Selection, bounds, transforms, camera state, and helpers should be exposed by `react-iiif-vault`, which already owns the Three.js objects and scene graph.

## Delivery plan

### Phase 1: comprehensible Scene contents, no upstream dependency

- Add the Scene contents panel and group its resources.
- Add friendly name resolution and type icons.
- Synchronize list selection with the existing properties editor.
- Improve the empty Scene state and model URL form.
- Show per-resource diagnostics already available from `ScenePanel.onDiagnostic`.
- Add explicit Edit/Preview mode and fallback-light messaging.
- Keep numeric transform editing as the precision fallback.

This phase makes the current feature understandable even before direct manipulation is available.

### Phase 2: direct model manipulation

- Consume upstream controlled selection and transform editing APIs.
- Add viewport selection, outline, Move/Rotate/Scale handles, local/world space, and snapping.
- Add frame selection, centre, place on floor, and reset actions using upstream bounds.
- Commit one Vault/history operation per completed gesture.
- Cover pointer, keyboard, undo, cancel, and serialization round trips.

### Phase 3: authored lighting

- Add the light chooser and Studio lighting shortcut.
- Add selectable light helpers and target visualization.
- Add type-specific inspectors and Aim at selection/Move to current view.
- Add image-based light URL entry and diagnostics.

### Phase 4: authored cameras

- Add Camera from current view.
- Add Free view/authored camera selection and Look through camera.
- Add camera helpers, frustums, update-from-view, projection controls, and target editing.
- Add starting-camera behavior only after confirming the Presentation 4 representation.

### Phase 5: refinement

- Add undo/redo polish and unsaved gesture protection.
- Add accessible keyboard alternatives and screen-reader announcements for selection and transform commits.
- Test focused/narrow layouts.
- Add Scene quality checks and larger-scene search/collapse behavior.
- Use real Presentation 4 fixtures with multiple models, all light types, authored cameras, nested scenes, and partial load failures.

## Not in the first iteration

- Material, mesh, skeleton, or animation-track editing inside a model.
- Uploading and hosting model assets.
- Physics, collision, or constraints.
- Arbitrary scene graph grouping that is not represented by Presentation 4.
- Multiple selection and bulk transforms.
- Renderer-specific shadows and post-processing.
- A custom glTF renderer in the Manifest Editor.
- Timeline authoring inside the Scene workspace.

These can be added when a concrete authoring need and Presentation 4 representation are established.

## Acceptance scenarios

1. A new user creates a Scene, pastes one public GLB URL, sees it load, moves it with a handle, renames it, adds Studio lighting, saves the current view as `Front`, previews it, downloads the Manifest, and reopens it with the same composition.
2. A user opens an existing Scene with generated IDs and can identify every model, light, and camera without opening raw JSON.
3. Selecting a model in either the viewport or Scene contents opens the same item and keeps both selection states synchronized.
4. A transform drag updates smoothly, Undo reverses the whole drag in one step, and export contains valid Presentation 4 transforms.
5. A broken model URL reports an error on that row while other resources and the viewport continue to work.
6. A Scene with only fallback lighting clearly warns that the light is not authored; adding a light removes the warning.
7. Orbiting in Free view never changes an authored camera. Updating a camera requires an explicit action.
8. Edit mode helpers never appear in exported data or viewer Preview mode.
9. Existing Presentation 3 Canvas editing remains unchanged, including in a mixed Canvas/Scene Manifest.

## Prompt for `react-iiif-vault`

Use the following as an implementation request in the `react-iiif-vault` repository:

> Extend `ScenePanel` with a small, renderer-owned editing API so a host editor can select and transform painted Scene resources, frame them, visualize lights/cameras, and capture the current view without reimplementing the private GLTF and Three.js rendering pipeline.
>
> The Manifest Editor remains responsible for writing Presentation 4 resources to Vault. `react-iiif-vault` should expose interaction state and plain transform/view values; it should not mutate a Manifest or introduce an editor-specific data model.
>
> **1. Controlled resource selection**
>
> - Allow clicking rendered Models and editor helpers for cameras/lights to select their painting Annotation.
> - Add controlled `selectedAnnotation?: string | null` and `onSelectAnnotation?: (annotation: AnnotationNormalized | null) => void` props, or an equivalent controlled API.
> - Add `onPointerMissed`/clear-selection behavior.
> - Keep `ScenePanelHandle.selectAnnotation` and `useSceneControls()` synchronized with the controlled value.
> - Provide a simple selected-object outline or a supported hook/slot for one.
>
> **2. Transform editing**
>
> Add an optional editing configuration along these lines:
>
> ```ts
> type SceneTransformMode = "translate" | "rotate" | "scale";
> type SceneTransformSpace = "local" | "world";
>
> type SceneTransformValue = {
>   annotationId: string;
>   translation: [number, number, number];
>   rotation: [number, number, number]; // authored degrees
>   scale: [number, number, number];
> };
>
> type SceneEditingOptions = {
>   enabled: boolean;
>   mode: SceneTransformMode;
>   space?: SceneTransformSpace;
>   selectedAnnotation?: string | null;
>   translationSnap?: number | null;
>   rotationSnap?: number | null;
>   scaleSnap?: number | null;
>   showSelectionOutline?: boolean;
>   showLightHelpers?: boolean;
>   showCameraHelpers?: boolean;
>   onSelectAnnotation?: (annotation: AnnotationNormalized | null) => void;
>   onTransformChange?: (value: SceneTransformValue) => void;
>   onTransformCommit?: (value: SceneTransformValue) => void;
>   onTransformCancel?: (annotationId: string) => void;
> };
>
> interface ScenePanelProps {
>   editing?: SceneEditingOptions;
> }
> ```
>
> - Wrap the selected rendered resource in Drei `TransformControls`; do not require a custom `SceneResourceRenderer` for built-in models.
> - Disable orbit controls while a transform handle is active.
> - Apply live changes as runtime transform overrides and emit one commit at pointer-up.
> - Escape cancels and restores the pre-drag transform.
> - Convert world-space manipulation back into the selected resource's authored local coordinate space.
> - Preserve Presentation 4 transform semantics and order. Values returned to the host must be sufficient to author TranslateTransform, RotateTransform, and ScaleTransform without reading Three.js objects.
> - Vault-authored transform changes must update the rendered resource without remounting `ScenePanel`.
>
> **3. Bounds and framing**
>
> Extend `ScenePanelHandle` or `useSceneControls()` with:
>
> ```ts
> frameAnnotation(id: string, options?: { padding?: number }): void;
> frameAll(options?: { padding?: number }): void;
> getAnnotationBounds(id: string): {
>   min: [number, number, number];
>   max: [number, number, number];
>   center: [number, number, number];
> } | null;
> ```
>
> This is needed for Frame selection, Centre at origin, Place on floor, and sensible placement of new lights. Reuse the bounds already registered by built-in renderers.
>
> **4. Free-view camera capture**
>
> Expose renderer-neutral current view values:
>
> ```ts
> type SceneView = {
>   projection: "perspective" | "orthographic";
>   position: [number, number, number];
>   rotation: [number, number, number];
>   target: [number, number, number];
>   fieldOfView?: number;
>   viewHeight?: number;
>   near: number;
>   far: number;
> };
>
> getView(): SceneView;
> setView(view: SceneView, options?: { transition?: boolean }): void;
> frameAnnotation(id: string, options?: { padding?: number }): void;
> ```
>
> The host will use `getView()` to create or update a Presentation 4 PerspectiveCamera/OrthographicCamera. Orbiting the free view must not mutate an authored camera.
>
> **5. Editor helpers for authored components**
>
> - Render camera icons/frustums and light origins/arrows/cones when requested by `editing`.
> - Helpers must be selectable by painting Annotation ID and excluded from bounds, screenshots, normal viewer mode, and raycasts intended for Models.
> - Directional/spot helpers should visualize their resolved `lookAt` target.
> - Keep the existing `debug.lights` behavior for development; editor helpers should be stable public UI without debug labels.
>
> **6. Resource status**
>
> Add a subscription or callback that maps each painting Annotation ID to loading/ready/error state, resolved resource type, and bounds. The current runtime snapshot exposes renderer paths and a private ID index, which is not enough for a host's Scene contents list.
>
> A suitable shape would be:
>
> ```ts
> type SceneResourceStatus = {
>   annotationId: string;
>   resourceId: string;
>   resourceType: string;
>   status: "loading" | "ready" | "error";
>   error?: SceneDiagnostic;
>   bounds?: { min: [number, number, number]; max: [number, number, number] };
> };
>
> onResourceStatusChange?: (resources: SceneResourceStatus[]) => void;
> ```
>
> A failed resource must not prevent the rest of the Scene from rendering.
>
> **7. Vault4 hook types**
>
> `VaultProvider` and `useExistingVault` accept `Vault4`, but `useVault`, `useVaultEffect`, and `useVaultSelector` are still declared against the legacy Vault. Make these hooks generic over the active `Vault | Vault4`, with overloads that retain the concrete type where possible.
>
> **8. Tests and example**
>
> Add focused tests for selection synchronization, orbit-lock during transforms, live/change/commit/cancel events, world-to-local conversion, external Vault updates, bounds/framing, and camera view capture. Add one demo that selects and transforms a built-in GLB Model without supplying a custom renderer.
>
> Equivalent API names are fine. The required boundary is that the host deals in Annotation IDs and serializable values, while `react-iiif-vault` retains ownership of Three.js objects, loaders, bounds registration, camera controls, and render lifecycle.

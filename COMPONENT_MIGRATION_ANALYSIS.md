# Component Migration Analysis

This document provides a comprehensive analysis of the component migration status between the `ui` and `components` packages in the IIIF Manifest Editor repository.

## Background

The IIIF Manifest Editor project is migrating from styled-components in the `ui` package to modern CSS solutions (Tailwind CSS, Headless UI) in the `components` package. This document identifies the current status of this migration.

## 1. Components Still Using styled-components in the `ui` Package

A total of **67 files** in the `ui` package still use styled-components. These components are organized by directory:

### Atoms (31 files)

Located in `packages/ui/atoms/`:

- `Accordion.tsx`
- `Button.tsx`
- `ButtonRow.tsx`
- `CopyURL.tsx`
- `Dropdown.tsx`
- `DropdownPreviewMenu.tsx`
- `EditableContainer.tsx`
- `Editor.tsx`
- `EmptyProperty.tsx`
- `GlobalStyle.ts`
- `HeightWidthSwitcher.tsx`
- `HorizontalDivider.tsx`
- `Input.tsx`
- `JSONPreview.tsx`
- `LightBox.tsx`
- `Loading.tsx`
- `Main.tsx`
- `ModalHeader.tsx`
- `PaddedSidebarContainer.tsx`
- `PaddingComponent.tsx`
- `RadioButtons.tsx`
- `RecentFilesWidget.tsx`
- `ShadowContainer.tsx`
- `TemplateCard.tsx`
- `Thumbnail.tsx`
- `ThumbnailContainer.tsx`
- `VerticalDivider.tsx`
- `VisuallHidden/VisuallHidden.tsx`
- `WelcomeText.tsx`
- `WidgetHeader.tsx`
- `callouts/SuccessMessage.tsx`
- `callouts/WarningMessage.tsx`

### Layout Components (6 files)

Located in `packages/ui/components/layout/`:

- `CanvasContainer.tsx`
- `FlexContainer.tsx`
- `ModalBackground.tsx`
- `ModalContainer.tsx`
- `TabPanel.tsx`
- `Toolbar.tsx`

### Modal Components (1 file)

Located in `packages/ui/components/modals/`:

- `PreviewModal.tsx`

### Organism Components (6 files)

Located in `packages/ui/components/organisms/`:

- `Annotation/Annotation.styles.tsx`
- `Annotation/AnnotationPreview.tsx`
- `EmptyCanvasState/EmptyCanvasState.styles.ts`
- `GridView/GridView.styles.tsx`
- `RichMediaLink/RichMediaLink.styles.ts`
- `ThumbnailPagedList/ThumbnailPageList.styles.ts`

### Widget Components (1 file)

Located in `packages/ui/components/widgets/`:

- `LoadManifest/LoadManifest.style.tsx`

### Editor Components (1 file)

Located in `packages/ui/editors/`:

- `Input.tsx`

### Form Elements (3 files)

Located in `packages/ui/form-elements/`:

- `ComposableInput/ComposableInput.tsx`
- `InlineSelect/InlineSelect.styles.ts`
- `SelectSearchField/SelectSearchField.tsx`

### Madoc Components (14 files)

Located in `packages/ui/madoc/components/`:

- `BoxSelector.tsx`
- `CardButton.tsx`
- `EmptyState.tsx`
- `Modal.tsx`
- `StyledForm.tsx`
- `Tag.tsx`
- `callouts/BaseMessage.tsx`
- `callouts/ExperimentalMessage.tsx`
- `callouts/InfoMessage.tsx`
- `callouts/LoadingBlock.tsx`
- `callouts/SmallToast.tsx`
- `callouts/SuccessMessage.tsx`
- `callouts/WarningMessage.tsx`
- `icons/CloseIcon.tsx`

### Surface Components (1 file)

Located in `packages/ui/surfaces/`:

- `RaisedEditorial/RaisedEditorial.tsx`

### UI Components (3 files)

Located in `packages/ui/ui/`:

- `DeleteButton/DeleteButton.styles.ts`
- `MediaControls/MediaControls.styles.ts`
- `ViewControls/ViewControls.tsx`

## 2. Components Already Migrated to `components` Package

The following **11 components** exist in both the `ui` and `components` packages. The `components` package contains the modern implementations.

### Fully Migrated Components (2 components)

These components have been migrated from styled-components to modern CSS solutions:

#### EmptyState

- **UI location**: `packages/ui/madoc/components/EmptyState.tsx`
  - Uses styled-components
  - Old implementation
- **Components location**: `packages/components/src/EmptyState.tsx`
  - Uses Tailwind CSS (via `cn` utility)
  - Modern implementation
  - **Exported from `@manifest-editor/components`**

#### Modal

- **UI location**: `packages/ui/madoc/components/Modal.tsx`
  - Uses styled-components
  - Custom modal implementation with styled components
- **Components location**: `packages/components/src/Modal.tsx`
  - Uses Headless UI (`@headlessui/react`)
  - Modern, accessible modal implementation
  - **Exported from `@manifest-editor/components`**

### Duplicated Icon Components (9 components)

These icon components exist in both packages but don't use styled-components in either location. The `components` package versions are the canonical ones being exported:

1. **AddIcon**
   - UI: `packages/ui/icons/AddIcon.tsx`
   - Components: `packages/components/src/icons/AddIcon.tsx` ✓ Exported

2. **BackIcon**
   - UI: `packages/ui/icons/BackIcon.tsx`
   - Components: `packages/components/src/icons/BackIcon.tsx` ✓ Exported

3. **DownloadIcon**
   - UI: `packages/ui/icons/DownloadIcon.tsx`
   - Components: `packages/components/src/icons/DownloadIcon.tsx` ✓ Exported

4. **GridIcon**
   - UI: `packages/ui/icons/GridIcon.tsx`
   - Components: `packages/components/src/icons/GridIcon.tsx` ✓ Exported

5. **InfoIcon**
   - UI: `packages/ui/icons/InfoIcon.tsx`
   - Components: `packages/components/src/icons/InfoIcon.tsx` ✓ Exported

6. **MoreMenu**
   - UI: `packages/ui/icons/MoreMenu.tsx`
   - Components: `packages/components/src/icons/MoreMenu.tsx` ✓ Exported

7. **PreviewIcon**
   - UI: `packages/ui/icons/PreviewIcon.tsx`
   - Components: `packages/components/src/icons/PreviewIcon.tsx` ✓ Exported

8. **ManifestEditorLogo**
   - UI: `packages/ui/atoms/ManifestEditorLogo.tsx`
   - Components: `packages/components/src/ManifestEditorLogo.tsx` ✓ Exported

9. **Spinner**
   - UI: `packages/ui/madoc/components/icons/Spinner.tsx`
   - Components: `packages/components/src/Spinner.tsx` ✓ Exported

## Summary Statistics

- **Total files using styled-components in `ui` package**: 67 files
- **Total duplicate/migrated components**: 11 components
  - **Fully migrated from styled-components**: 2 components (EmptyState, Modal)
  - **Duplicated icons (no styled-components)**: 9 components
- **Components package exports**: All 11 duplicate components are exported from `@manifest-editor/components`

## Recommendations

1. **Phase out duplicates**: Consider removing the 11 duplicate components from the `ui` package once all imports have been migrated to use `@manifest-editor/components`.

2. **Continue migration**: The remaining 67 files using styled-components in the `ui` package should be gradually migrated to the `components` package using modern CSS solutions (Tailwind CSS, Headless UI, etc.).

3. **Update imports**: Audit the codebase to ensure all code is importing from `@manifest-editor/components` rather than `@manifest-editor/ui` for the migrated components.

4. **Deprecation plan**: Create a deprecation plan for the `ui` package components that have been migrated to the `components` package.

## Package Differences

### `ui` Package
- Uses styled-components for styling
- More granular exports (specific paths like `@manifest-editor/ui/atoms/Button`)
- Private package (not published)
- Contains legacy components and implementations

### `components` Package
- Uses modern CSS solutions (Tailwind CSS, Headless UI)
- Single entry point with all exports from main index
- Published package (public)
- Contains modern, migrated components with better accessibility and styling

## How This Analysis Was Generated

This analysis was generated by:
1. Scanning all TypeScript/TSX files in both packages
2. Searching for `styled-components` imports in each file
3. Comparing filenames between packages to identify duplicates
4. Examining duplicate components to determine migration status
5. Checking package exports to identify canonical versions

Last updated: 2025-11-06

# Component Migration Quick Reference

This is a quick reference guide for developers working on the component migration from `ui` to `components` packages.

## Current Status

- **67 components** in the `ui` package still use styled-components
- **2 components** have been successfully migrated: `EmptyState` and `Modal`
- **9 icon components** exist as duplicates (ready for cleanup)

## For Developers

### When to use which package?

#### Use `@manifest-editor/components` for:
- ✅ New component development
- ✅ Any of the following components (already migrated):
  - `Modal` - Modern Headless UI implementation
  - `EmptyState` - Tailwind CSS implementation
  - All icons: `AddIcon`, `BackIcon`, `DownloadIcon`, `GridIcon`, `InfoIcon`, `MoreMenu`, `PreviewIcon`, `ManifestEditorLogo`, `Spinner`

#### Use `@manifest-editor/ui` for:
- ⚠️ Legacy components not yet migrated
- ⚠️ Components with styled-components dependencies

### Importing Components

```typescript
// ✅ GOOD: Import from components package (migrated components)
import { Modal, EmptyState } from '@manifest-editor/components';

// ⚠️ OLD: Import from ui package (being phased out)
import { Modal } from '@manifest-editor/ui/madoc/components/Modal';
```

### Migration Checklist

When migrating a component from `ui` to `components`:

1. ☐ Remove styled-components dependency
2. ☐ Convert to Tailwind CSS or Headless UI
3. ☐ Add component to `packages/components/src/`
4. ☐ Export component from `packages/components/src/index.tsx`
5. ☐ Update all imports across the codebase
6. ☐ Test component in all usage contexts
7. ☐ Update documentation
8. ☐ Mark as migrated in `component-migration-status.csv`

## Package Information

### `@manifest-editor/ui` (Legacy)
- **Status**: Being phased out
- **Styling**: styled-components
- **Published**: No (private package)
- **Type**: Monorepo package with granular exports

### `@manifest-editor/components` (Modern)
- **Status**: Active development
- **Styling**: Tailwind CSS + Headless UI
- **Published**: Yes (public package)
- **Type**: Published package with single entry point

## Documentation

- Full analysis: [COMPONENT_MIGRATION_ANALYSIS.md](./COMPONENT_MIGRATION_ANALYSIS.md)
- Tracking sheet: [component-migration-status.csv](./component-migration-status.csv)

## Questions?

If you're unsure whether a component has been migrated:
1. Check `component-migration-status.csv`
2. Look at `packages/components/src/index.tsx` for the export
3. Prefer imports from `@manifest-editor/components` when available

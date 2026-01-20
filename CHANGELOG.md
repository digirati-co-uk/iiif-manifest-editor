# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased](https://github.com/digirati-co-uk/iiif-manifest-editor/compare/v2.0.1...main)

### Added

- `@manifest-editor/creator-api`
  - Added new `withInitialData()` helper which can be used to extend creator definitions statically with custom data passed to them (e.g. configuration)
  - Added new `withCustomRender()` helper which can be used to customise the form render function of the creator.
- `@manifest-editor/shell`
  - Added new `iiifBrowserOptions` initialData options to IIIF Browser creator (Both Manifest + Collection variations).
  - Added new provider `<CreatorInitialData />` for injecting initial data at the top level.

```tsx
import { CreatorInitialData } from "@manifest-editor/shell";

<CreatorInitialData id="@manifest-editor/iiif-browser-creator" data={{ iiifBrowserOptions: { ... } }}>
  <ManifestEditor />
</CreatorInitialData>
```

### Updated

### Fixed

### Removed

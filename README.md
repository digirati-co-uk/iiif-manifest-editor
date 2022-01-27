# iiif-manifest-editor

> Create new IIIF Manifests. Modify existing manifests. Tell stories with IIIF.

## Background

In 2017 we started working on [IIIF Manifest-driven narratives](https://medium.com/digirati-ch/reaching-into-collections-to-tell-stories-3dc32a1772af) for the V&A, and in 2018 for [Delft University of Technology Library](https://drive.google.com/file/d/1ZRXJaOYNbOD0jsOF79maKhxl5re4-2Kt/view). These were based on the first iteration of our [Canvas Panel](https://canvas-panel.digirati.com/#/) component.

In 2018 we developed an experimental [IIIF Workbench](https://www.youtube.com/watch?v=HHQdQ8Ti5eI&t=12s) for assembling complex canvases in a visual environment (like PowerPoint).

These combined to make a [IIIF Manifest Editor](https://www.youtube.com/watch?v=D8oA3rHbvPM) that in normal, default mode produces IIIF Presentation 3 Manifests, but can be extended with plugins to produce IIIF Manifests with particular structures and custom `behavior` properties, to drive custom viewing experiences - slideshows, guided viewing and the complex digital exhibition layouts seen in the Delft examples. Development of branches of the Manifest Editor for different clients went hand in hand with new viewers and static site generators.

We have ended up with multiple versions of the Manifest Editor, with different IIIF capabilities, user interfaces, and persistence mechanisms. Some versions integrate with our DLCS platform, allowing drag-and-drop creation of IIIF Image Services in real time.

We don't want to needlessly throw away the capabilities we have, but we want to maintain one editor going forward, that is simple and reliable to use, with excellent user experience. This might mean dropping features in the interests of a sustainable code base - budgets for development aren't getting any bigger.


## Audience

 - IIIF novices using a visual, PowerPoint-like tool for creating Manifests intended for viewing in Univeral Viewer, Mirador and other standard IIIF environments
 - Museum staff assembling manifests intended for custom storytelling or digital exhibition environments


## Features

 - Create new Manifest
 - Add Canvas
 - Add resources to Canvas
 - Browse IIIF (via IIIF Collections) to import Canvases
 - Load any compliant version 2 or version 3 Manifest
 - Use the [new version of Canvas Panel](https://deploy-preview-50--iiif-canvas-panel.netlify.app/) as the editing surface
 - Log in to GitHub from the hosted editor and [persist to gh-pages](https://github.com/digirati-co-uk/iiif-manifest-editor/issues/1), to serve your manifests
 - Allow the Manifest Editor to be embedded as a VS Code plugin for direct saving to file system  

## Dropped features

 - Direct DLCS integration - instead, use DLCS portal to [create source manifests and image services](https://drive.google.com/file/d/14d-HcbftIt1qMhx-qV1jf29Hkn9e03E2/view?usp=sharing).
 - Any other custom persistence methods apart from the two listed above
 - Don't make _Preview_ part of the tool itself. A Manifest Editor plugin simply defines editing environment behaviour and fields, it doesn't have to incorporate a preview too. Instead, configure a link for the plugin that the Manifest Editor can pass a custom Manifest to for preview. Which will be a standard viewer for normal mode.

## Defining and capturing custom extensions

 - Plugins define the additional behaviours and their permitted values their associated viewing environments require
 - Manifest Editor renders user interface defined by the plugin (like a [capture model](https://cultural-heritage.digirati.com/building-blocks/annotation-studio/))

 ## Process

 - Strip back everything and start with GitHub login and persistence - even if it's just a text editor
 - Work back up to the UI that's proven to work and liked by its current users, using Canvas Panel for rendering
 - Fix or drop things that don't work

 How much of the UI we already have will be able to return?

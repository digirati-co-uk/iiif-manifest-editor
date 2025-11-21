# Digirati IIIF Manifest Editor

An open-source, IIIF editing tool, the Manifest Editor is designed to provide a visually intuitive tool for creating, editing and updating IIIF Manifests and more. The Manifest Editor can be used as-is or can be further customised to support institute or organisation specific requirements.

![screenshot of Manifest Editor](manifest-editor.png)

- [Try it!](https://manifest-editor-site.netlify.app/)

## What is the Digirati IIIF Manifest Editor?

The Manifest Editor is an open-source web based editor, built from the ground up using IIIF, JS and HTML. You can use it to create new manifests, adding metadata, creating and managing canvases for simple and complex IIIF manifest requirements. You can preview your work in progress in a range of configured IIIF viewers, whilst you can share your work in progress or completed manifest with other users.

You can edit existing manifests to update and test changes ranging from simple metadata additions, to adding annotations, changing manifest behaviours and adding navPlace data to support enriching your presentation with map-based interfaces.

It is also possible to simply provide the option to allow users to view manifests, supporting learning and exploration of IIIF Manifests and how these are assembled by institutes and organisations to deliver rich, engaging only viewing experiences.

## Features

- Create and edit new Manifest(s)
- Open and edit an existing Manifest(s) from disk or URL
- Add Canvas(es) to Manifest, order and manage canvases within Manifest
- Add single resources (media for example) to a Canvas
- Add multiple resources (image choices, collages for example) to a Canvas
- Edit all properties of Manifests, Canvases and other IIIF resources (add and edit annotations for example)
- Ability to browse IIIF (via IIIF Collections) to import Canvases
- Extensible application enabling further customisation and configuration specific to institute or organisational use cases and workflows

## The latest version

The current Manifest Editor reflects our experience gained in building content creation tools and custom viewing experiences, while user research has helped inform some of the core functional and usability improvements.

We have taken an approach to ensure the tool is more sustainable, both by continuing to build the tool using existing components (which are used by others in a range of scenarios) and by ensuring it is easier (and cheaper) for us and others to customise and adapt.

This means a separation of viewing/previewing from content creation for most scenarios. We have ended up with multiple versions of the Manifest Editor in the past, with different IIIF capabilities, user interfaces, and persistence mechanisms. Some versions integrate with our IIIF Cloud Services platform, allowing drag-and-drop creation of IIIF Image Services in real time.

We don't want to needlessly throw away the capabilities we have, but we want to maintain one editor going forward, that is simple and reliable to use, with excellent user experience. The needs of different adopters and users should be met by configuration, and choice of plugins, rather than different versions of the core editor.

## Background

In 2017 we started working on [IIIF Manifest-driven narratives](https://medium.com/digirati-ch/reaching-into-collections-to-tell-stories-3dc32a1772af) for the V&A, and in 2018 for [Delft University of Technology Library](https://drive.google.com/file/d/1ZRXJaOYNbOD0jsOF79maKhxl5re4-2Kt/view). These were based on the first iteration of our [Canvas Panel](https://iiif-canvas-panel.netlify.app/) component.

In 2018 we developed an experimental [IIIF Workbench](https://www.youtube.com/watch?v=HHQdQ8Ti5eI&t=12s) for assembling complex canvases in a visual environment (like PowerPoint).

These combined to make a [IIIF Manifest Editor](https://www.youtube.com/watch?v=D8oA3rHbvPM) that in normal, default mode produces IIIF Presentation 3 Manifests, but can be extended with plugins to produce IIIF Manifests with particular structures and custom `behavior` properties, to drive custom viewing experiences - slideshows, guided viewing and the complex digital exhibition layouts seen in the Delft examples. Development of branches of the Manifest Editor for different clients went hand in hand with new viewers and static site generators.

## Audience

The Manifest Editor has been developed to support users creating and editing IIIF content; with a focus on usability to enable those wishing to learn or already familiar with the IIIF standard.

There are a whole range of use cases for visually editing IIIF Manifests; from within the context of museums, libraries, archives and their workflows to research and education. The Manifest Editor can be used as is, or it can be further configured and customised to support specific requirements.

## Join the discussion

We're using [GitHub discussions](https://github.com/digirati-co-uk/iiif-manifest-editor/discussions) to explore ideas, and the [Wiki](https://github.com/digirati-co-uk/iiif-manifest-editor/wiki) to think about implementation.

## Acknowledgements

The development of the IIIF Manifest Editor has been supported by:

- [Delft University of Technology Library](https://www.tudelft.nl/library)
- [The National Gallery](https://www.nationalgallery.org.uk/), [Practical applications of IIIF](https://tanc-ahrc.github.io/IIIF-TNC/) project funded by [AHRC](https://ahrc.ukri.org/) as a [Foundation Project](https://www.nationalcollection.org.uk/Foundation-Projects) within the [Towards a National Collection](https://www.nationalcollection.org.uk/) programme. [Dec 2021 - Apr 2022]
- [Canadian Research Knowledge Network](https://www.crkn-rcdr.ca/en)

## Release Flow

Adapted from [azu/monorepo-github-releases](https://github.com/azu/monorepo-github-releases/tree/main) see instructions.

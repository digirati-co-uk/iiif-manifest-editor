It is essential to Preview your work as you go.

For IIIF, this means going to some other software, and *getting it to load your manifest*.

![Preview menu](https://user-images.githubusercontent.com/1443575/151703497-af4d008a-578d-4269-859f-8e9b5cffe21c.png)

This menu is governed by configuration. Each entry includes a templated URL, into which the editor can insert the Manifest URL.

This is the tricky part for IIIF Editor Software, because it means that the other software - Mirador, UV, your bespoke slideshow player - has to load the manifest from *somewhere*. It has to provide a URL on the web - or something else

Ways round the problem

* It is possible for a collaborating viewer to accept JSON directly, in data URLs - but only some viewers will accept this.
* You can save the file locally _(how?)_ and view via a localhost web server
* You can push to GitHub and view via gh-pages
* (more)

While all of these are valid, it's much easier to *always be able to stage the manifest on an external, https URL with the correct CORS headers, with no caching or availability delays*.

## The built in Preview service

All instances of the Manifest Editor have access to the service described in this RFC:

https://github.com/digirati-co-uk/iiif-manifest-editor/blob/main/docs/rfcs/001-iiif-sandbox.md

This adds a "Raw Manifest" link as the first item in the Preview menu - every time it's invoked, a new version will be pushed to the preview service (using the Update address).
The other entries by default accept URL templates into which they insert the Preview URL. 

The Editor sends the JSON to the service, waits for a 20x HTTP response, and only then invokes the preview (e.g., open the UV in a new window, showing the manifest at that Preview URL).

## Preview and Permalink

By default the preview service has a 48 hr expiry time. But exactly the same service is available from the [[Save|Saving IIIF]] menu, as a permalink - the only difference is that when saved here, the hosted IIIF resource does not expire, so can be shared.

## Customising the Preview via Config

This is where custom config adds in specific viewing environments (or removes Mirador/UV). For example, a custom slideshow viewer, or a digital exhibition like Delft.

The preview button and its dropdown are set from config, with the direct button press being the same as the first item in the dropdown.
We allow for other preview mechanisms in future by stating that this preview entry uses the preview service. For this, a preview entry must provide a format string - that tells the Manifest Editor where to insert manifest URIs. E.g.,

```json
"preview": [
  {
    "label": "Universal Viewer",
    "mechanism": "previewService",
    "template": "https://universalviewer.io/examples/#?manifest={iiifResource}" 
  },
  {
    "label": "Ocean Liners",
    "mechanism": "previewService",
    "template": "https://canvas-panel.digirati.com/#/examples/fullpage?manifest={iiifResource}" 
  },
  {
    "label": "Raw Manifest",
    "mechanism": "previewService",
    "template": "{iiifResource}" 
  }
]
```

(see [[Configuration]] for more details).

## Informing the user

The Manifest Editor should be aware of the TTL set by the preview and inform the user. 
When clicking the preview button or an option from the drop down, the Manifest Editor:

1. Pushes the current Manifest to the preview service
2. If any errors, show message and abort
3. Once it has a response with a ttl, open a new window on the formatted template string, replacing {iiifResource} with the URL
4. Using a non-modal alert (e.g., a bar) message the user that the link will expire in xxx hrs.
5. Include a "don't show again" in this bar.

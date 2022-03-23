
## Test 3: Creating a book from Image Services.

The goal of this test is to create a Manifest for a book out of existing, hosted IIIF Image Services.
In this scenario the images have already been made available via the IIIF Image API.

As a digitised book, there is some additional useful information beyond the sequence of images. We want it to render correctly when viewed in bookreader-type viewers that understand recto/verso distinctions.

## Materials

To avoid to much work, this is a very short book!

You're going to need the following image services:



The text to use is provided at each step of this test script.

## Steps

### 1. Open the Manifest Editor

Visit [https://manifest-editor-testing.netlify.app/](https://manifest-editor-testing.netlify.app/).

If you have never been here before, you'll see a Splash Screen, which you can dismiss.
If you have been here before, your settings might automatically load the manifest you last worked on.

Either way, start a new Manifest with File -> Open, and pick "Empty Manifest".

### 2. Add canvases

For each of the IIIF Image Services, add a new Canvas, one by one.
Find the simplest way to add a Canvas.
You shouldn't need any information other than each image service URL in the list.

### 3. Preview your work

Once you have added 5 canvases or so, see what your work would like in the Universal Viewer, and in Mirador, by using the Preview feature.

Send a preview link to a friend, so they can see what it looks like too. (You can send to yourself for the test).

### 4. Finish adding canvases

Add the remaining images services, in the same way as before - as new canvases.

### 5. Add some descriptive information

Give your Manifest the following _Label_, in French:

--label here--

Also provide the label in English:

--label here--

Give your Manifest a _Description_, in English.

--description here--

Pick a Rights Statement for your manifest.

Give each canvas a _Label_ - use the printed page number, where it's visible in the image.
For these numerals as labels, set the language to `none`.

Add some pairs of metadata (labels and values) to the Manifest.
For example, include information about the Author, and where and when it was published.
Add a few metadata fields to the manifest, and try re-ordering them.

### 6. Set the Manifest behavior

We need to provide information to viewer software that this is a printed book in the correct page layout.

Find where to set the Manifest `behavior` property to `paged`.
Follow the help hint from the Manifest Editor to the relevant part of the IIIF Specification to read more information on `behaviour`.

Set the Manifest behavior to `paged`.


### 7. Save your work more permanently

While the preview link is useful, it only lasts for 48 hours. 
This version of the Manifest is integrated with a "permalink" service.
Save your work more permanently, and send a link to the saved IIIF Manifest to a friend (or yourself).


### 8. Export as a different version

You would like to use this Manifest in a tool that only supports IIIF Presentation 2.

While you can't save in this form to the permalink service, you can still generate the IIIF Presentation 2 Manifest and download it.

Find where to export the manifest in the IIIF Presentation 2 format and download it to your computer.


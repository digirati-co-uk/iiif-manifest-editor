
## Tasks Combined 1: Creating a book from Image Services and Static Images.

<!-- Welcom message -->
The goal of this test is to create a Manifest for a book out of existing, hosted IIIF Image Services.

## Scenario

In this scenario the images have already been made available via the IIIF Image API. You have been given a list of image services for the digitised pages.

As a digitised book, there is some additional useful information beyond the sequence of images. We want it to render correctly when viewed in bookreader-type viewers that can show page openings.

To avoid too much work, this is a very short book!
The image services you'll need are listed on this page, ready for copying:
[https://digirati-co-uk.github.io/me-testing/03-image-services.html](https://digirati-co-uk.github.io/me-testing/03-image-services.html)

We recommend **re-opening this page in a separate window** now, as further links in the tasks ahead will replace it in the test browser window.

Auto-open URL: https://digirati-co-uk.github.io/me-testing/03-image-services.html

## Tasks

### 1. Familiarisation

This is the URL of a IIIF Manifest: 
https://iiif.wellcomecollection.org/presentation/b18725259

(You can open that URL and look at it if you want, but don't have to).

Copy the Manifest URL above.

Now open the Manifest Editor, at
https://manifest-editor-testing.netlify.app/

If you have never been here before, you'll see a Splash Screen, which you can dismiss.
If you have been here before, your settings might automatically load the manifest you last worked on.

Tell us what you are thinking as you look at the Manifest Editor and try the following:

Can you open this URL in the Manifest Editor?

Can you get a visual overview of the whole manifest?

Can you see individual _canvases_ (pages)?

Can you see information for an individual _canvas_?

What other views are available, and what do you think they mean? What are they telling you? 
What would you use them for?

**Loading a different Manifest**

Outside of the Manifest Editor, find a different IIIF Manifest (from anywhere you like)

Can you do the same things with this Manifest as you can with the first one?


### 2. Starting a new, blank Manifest

If you have closed the window from the previous task, visit [https://manifest-editor-testing.netlify.app/](https://manifest-editor-testing.netlify.app/).

Either way, start a new Manifest with File -> New, and pick "Blank Manifest".


### 3. Add canvases

For each of the IIIF Image Services in the list provided earlier, add a new Canvas, one by one.
Find the simplest way to add a Canvas.
You shouldn't need any information other than each image service URL in the list.

### 4. Preview your work

Once you have added 5 canvases or so, see what your work would like in the Universal Viewer, and in Mirador, by using the Preview feature.

Send a preview link to a friend, so they can see what it looks like too. (You can send to yourself for the test).

### 5. Finish adding canvases

Add the remaining images services, in the same way as before - as new canvases.

### 6. Add some descriptive information

(This text is also available on the help page at [https://digirati-co-uk.github.io/me-testing/03-image-services.html](https://digirati-co-uk.github.io/me-testing/03-image-services.html))

Give your Manifest the following _Label_, in Italian:

```
Una modificazione nelle forbici chirurgiche
```

Also provide the label in English:

```
A modification in surgical scissors
```

Give your Manifest a _Description_, in English.

```
By Fabrizj, Paolo, 1806-1859. 13 pages, 1 unnumbered folded plate : illustrations ; 23 cm
```

### 7. More descriptive information

Pick a Rights Statement for your manifest.

Give each canvas a _Label_ - use the printed page number, where it's visible in the image.
For these numerals as labels, set the language to `none`.

Add some pairs of **metadata** (labels and values) to the Manifest.
For example, include information about the Author, and where and when it was published.
Add a few metadata fields to the manifest, and try re-ordering these fields.

Preview the effects of these changes as you go, in Mirador and Universal Viewer.


### 8. Set the Manifest behavior

We need to provide information to viewer software that this is a printed book in the correct page layout.

Find where to set the Manifest `behavior` property to `paged`.
Follow the help hint from the Manifest Editor to the relevant part of the IIIF Specification to read more information on `behaviour`.

Set the Manifest behavior to `paged`.

Does this result in different behaviour in the Universal Viewer?


### 9. Save your work more permanently

While the preview link is useful, it only lasts for 48 hours. 
This version of the Manifest is integrated with a "permalink" service.
Save your work more permanently, and send a link to the saved IIIF Manifest to a friend (or yourself).


### 10. Export as a different version

You would like to use this Manifest in a tool that only supports IIIF Presentation 2.

While you can't save in this form to the permalink service, you can still generate the IIIF Presentation 2 Manifest and download it.

Find where to export the manifest in the IIIF Presentation 2 format and download it to your computer.

### 11. Add static (non-IIIF) images

For the last part of the test, you're going to add some additional canvases to the Manifest.

You've collected links to some interesting high resolution images and want to add them to this Manifest.

To start, you need the URLs of some hi-res images, in JPEG format. These can be anything - artworks, your own photos - but they need to be on the web already. 

A good source might be [NASA image galleries](https://www.nasa.gov/multimedia/imagegallery/index.html), where all the images are public domain.
These don't have much in common with the Manifest you've buitl so far, but it's OK for this test - the difference between the pages and the images will be more obvious.

On this page we have collected 10 image links from the Apollo Image Gallery that you can copy into the Manifest Editor
[https://digirati-co-uk.github.io/me-testing/02-images.html](https://digirati-co-uk.github.io/me-testing/02-images.html)

We recommend **opening this page in a separate window now**, as further links in the tasks ahead will replace it in the test browser window.

### 12. Add more canvases

Add some new canvases, using your list of static images. 
Find the simplest way to add a Canvas.
You shouldn't need any information other than each URL in your list.

Is this any different from the earlier process of adding canvases using image services?


### 13. Re-order the canvases

Re-order the image canvases. Try:

- swapping two canvases
- moving the last canvas to the start
- moving a canvas from the middle of the manifest to the end

(hint? - do this in the grid overview)

Try setting the `behavior` property of the image canvases to `non-paged`.

### 14. Save again

Save the re-ordered manifest so that it replaces the original version with your original ordering.


### Final Message

Thank you for joining in our testing!
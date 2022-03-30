## Test 6: Creating a guided viewing experience

The goal of this test is to create a Manifest that targets a custom viewing experience rather than a standard IIIF viewer.

In this case the result will be a tour of an ocean liner.

## Material and requirements

Links to an image service and HTML for the parts of the tour are provided below.

The Manifest Editor needs to be configured with a non-standard preview environment called "Ocean Liners".

> Note: in a later version of this test, the input field will be a WYSIWTG editor, so you won't be entering HTML directly.

### 1. Create a blank Manifest

Open the Manifest Editor and start a new Manifest from the Blank template.

Give the Manifest a Label of "Ocean Liners" and set the language to English.

### 2. Add the single Canvas

Create a new Canvas from this IIIF Image Service URL:

https://framemark.vam.ac.uk/collections/2013GU2911/info.json

### 3. Create the annotations

Now you will create the points of interest by drawing boxes on the canvas.

Each of the following annotations should have the motivation `describing`, and the body of the annotation should be a **TextualBody**.

Can you see how to create annotations that meet these requirements?


https://stephenwf.github.io/ocean-liners.json




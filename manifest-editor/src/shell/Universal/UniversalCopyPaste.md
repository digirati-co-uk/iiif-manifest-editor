# Universal Copy and Paste

The way the clipboard API works, it allows for multiple formats of a resource to be copied
at the same time. For example, if you "copied" an HTML element, you might have the following in your clipboard (just representative):
```json
{
  "text/plain": "this is an html element",
  "text/html": "<strong>this is an html element</strong>"
}
```

A clever implementation can extend this, for example, you could add a "copy as markdown"
```json
{
  "text/plain": "this is an html element",
  "text/html": "<strong>this is an html element</strong>",
  "text/markdown": "**this is an html element**"
}
```

Similarly, when you paste - the target can look for the desired content types and pick which it wants to use.

This universal copy and paste looks to extend this with content types + custom profiles so that when you copy a resource somewhere in the application, it populates a set of content types with different useful pieces.

A complete example. If you copied the canvas in the [MVM Image cookbook manifest](https://iiif.io/api/cookbook/recipe/0001-mvm-image/manifest.json), it _could_ populate the clipboard with something like this:

```json
{
  "text/plain+iiif-content": "JTdCJTIyaWQ...",
  "application/json+ld;profile=...": "{\"id\": \"...}"
}
```
These are not final or designed, just thrown together to describe the goals of the mechanism.

## Data types
There can be different "things" that can be copied and pasted across the application. 

- **Manifest / Collection** - could populate a "partOf" field
- **Canvas** - copying from one manifest to another, or cut and paste for reordering 
- **Annotation** - Moving or copying annotations in a list, painting or otherwise
- **Content resources** - Images, audio, video, text or any content bodies
- **Services** - Image services, auth or other things that can be attached to resources
- **Lists** - List of one or more of the above (possibly mixed?)

## Data formats

## Post-processing

## Interactions



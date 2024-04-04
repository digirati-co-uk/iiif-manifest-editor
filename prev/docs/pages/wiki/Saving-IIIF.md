There is a distinction between persistence of the IIIF JSON people are making (the Manifest, or sometimes the Collection), and the content assets (images, but also videos, audio etc) that are referenced from their IIIF JSON. The Manifest Editor is only editing JSON - text files with links to images, image services etc, but not those images and image services themselves.

This is not obvious to a casual user - if it’s like PowerPoint, can’t I just drag my images in and they become part of the slide deck? We can make the manifest editor work like this - but not on its own! If the addition of content from your own desktop is supported, the manifest editor has to be taking that content and sending it somewhere where it can be hosted (i.e., hosted on the web) and, optionally, transformed (typically, make an image service from the content). 

Many users of the ME do not need this ability, especially inside a museum, library or other place where the assets to be used are already hosted, and often already hosted as IIIF image services. In fact it’s the casual, walkup user who most needs the ability to create new hosted image content, but they are the least likely to be able to provide it!

This page is about how the application saves the JSON of the manifest. How the user transforms an image on their desktop (or even phone) into a hosted image, or hosted image service, is either outside of the editor completely (the default scenario), or via a plugin that provides an [[Import of Content Resources]] component for the Shell that is able to trigger hosting and, sometimes, transformation to an image service. For example, a DLCS plugin.

## Export of IIIF

This is simple so get this out of the way. The Shell generates a pseudo download JSON blob or preview (show JSON in new window or modal, user can cut and paste). This is always available unless explicitly configured off.

## Save and Save as 

The Save behaviour may be aligned with the [[loading|Loading IIIF for Editing]] behaviour but not necessarily exactly aligned - e.g., you can load a manifest from a special integration point (like GitHub, or a CMS) and you can load ANY manifest from anywhere, but you can only save to the special integration point. Regardless of how you loaded something, the first time you Save, you will enter the full "Save as" process - it will be much more common to Save somewhere different from where you loaded the Manifest. Some plugin providers will provide both a Load Plugin and a Save Plugin, which can look similar (e.g., they simulate loading and saving to a file system, or IIIF Collections).

Once you have saved the current Manifest once, subsequent Save actions will Save the manifest to the same location - if that location supports it! Some plugins will always require interaction here. Therefore it's a [[Configuration]] setting - whether the Shell can invoke a Save on the plugin without re-opening the dialog. (*Save as...* would always be available regardless).

## Similarity to [[Loading IIIF for Editing]]

This dialog works the same way, in that the extension(s) are "tabs" or equivalent within the dialog; the dialog itself is managed by the Shell. It's likely there will be fewer tabs, though. These tabs include:

### Permalink

The first Save location is present by default, unless turned off in [[Configuration]]. It uses the same service as [[Preview]] - the only difference being that there is no _expiry_ of the saved Manifest - it will be available at that URL for as long as the service is kept going.

This component will manage the update location (see [[Preview]]) so that repeated re-saving of the current manifest updates the permalink version rather than creating a new one. If you want to create a new one, use Save As.

### GitHub

This is explained in more detail in [[GitHub Integration]]. You must be logged into GitHub through the tool for this to work (unlike opening a Manifest from GitHub, which is permitted for public repositories).
The UI allows you to choose a repo, and navigate to a save location. You can change branches, and provide a commit message. There is a default commit message set in configuration which will be applied if you don't provide one; setting this to an empty string in config will make the plugin require a commit message to be entered.

### Save to IIIF

> NB we won't do this part initially, but it could follow on.

IIIF Collection URLs accept posts of manifest JSON, like saving a file. You can also PUT a manifest to a URL. We could provide a docker image that implements this over an S3 backend? We could host one or you can host one… Uses [[IIIF Browser]] too! 
To the user this feels just like browsing IIIF for opening or importing, except that you are choosing a save "folder" (a IIIF Collection) for POSTing or a file (a Manifest) for PUT. Whereas browsing a collection and selecting a manifest is just navigation of IIIF resources, _Saving_ to IIIF means agreeing on an additional, very simple [[IIIF Write Protocol|REST protocol]]. 

The Manifest editor sends the JSON somewhere on save. The simple implementation of this is HTTP PUT to a manifest URL or POST to a collection; the back end takes care of storing it. We can provide a container that implements this over an S3 backing, for reference. Or you can provide your own. As with loading, the task for integration need not be making a new visual component - if you provide an endpoint that supports this [[IIIF Write Protocol]], it will work with the built-in component - just provide the starting point in config - which might be the same as your [[Loading IIIF for Editing]] start point.



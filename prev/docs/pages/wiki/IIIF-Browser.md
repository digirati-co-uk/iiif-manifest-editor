aka Content State Selector

This is a component of a component:

 - it's part of the File -> Open for [[opening a manifest for editing|Loading IIIF for Editing]]
 - it's also part of the [[Import of IIIF Resources]] process for selecting resources for inclusion in the manifest being edited (e.g., a canvas)
 - it's also part of the [[Import of Content Resources]] process, though it behaves in a different way

For importing IIIF, it loads an external reference to one or more IIIF resources into the Vault and then returns Vault refs to the caller. The editor can connect those refs to the manifest being edited _if required_ - as a Shell component, it's not going to place them.

For importing content resources, it does not put anything in the Vault, it returns a IIIF Content resource object to the caller, which it can add to a Vault resource (e.g., returns an image for placing on a Canvas). In this mode, it's returning `painting` annotation bodies from external IIIF Canvases, rather than the external canvases themselves

It offers one or more Collection starting points for browsing, e.g., the Editor's own out-of-the-box Top Level Collection _and_ the IIIF Cookbook.
These are set in [[Configuration]], so adopters can add their own, or replace the defaults.
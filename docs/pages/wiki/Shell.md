The Shell is the outer UI container, and also provides application services to the active [[App|Apps]].

![Shell top bar](https://user-images.githubusercontent.com/1443575/151572410-384913fb-013f-4b12-a930-101a120f2bdb.png)

The menu items, top bar, and active states of commands and buttons are controlled through config but also controlled by the loaded App; it might rely on the Shell for particular functions rather than replicate them, but needs to control their availability because they are not applicable to all contexts.

Available Apps make their presence felt at appropriate places in that top UI.

There is no footer; the Shell is visually only the very top. This allows Apps to provide a footer if they want one, and also decide whether they fit to the browser viewport or extend below, as their content and functionality require.

The Shell has an instance of [Vault](https://iiif-canvas-panel.netlify.app/docs/components/vault/): the loaded App gets a reference to this Vault and all the App's manipulation of the IIIF must happen via this Vault.

Shell responsibilities

 - The Shell looks after Vault. 
 - The Shell manages [[Undo and Redo]] - rolls Vault back (or forward); Apps can respond to this by updating their UI.
 - Importing, Loading, Saving (see below)
 - Warning about unsaved changes (unsaved Vault state) if user goes to Load new resource (but not import!), or tries to close the browser
 - Manages [[Preview]] functionality

[[Persistence|Saving IIIF]] is more complicated than new users might expect; the Shell's `File` menu launches whatever mechanisms are [[configured|Configuration]] to get IIIF JSON into the Vault, and to take that JSON from the Vault and persist it somewhere else. These are `Save` and `Save as`. `Export` also allows direct download or viewing of the current raw JSON.

[[Import of IIIF|Import of IIIF Resources]] (for inclusion in the current manifest) and [[Import of Content|Import of Content Resources]] resources are also available via the Shell. The former adds resources to Vault but not to the Manifest (that's the App's job). The latter returns a Content Resource to the App, for (usually) including in the Manifest. A plugin that provides content resources might be doing more than simply passing on the URL of a web hosted image: it might be browsing an institutional image server, or even triggering the creation of a IIIF Image Service from an uploaded image. 

The current App doesn't have to worry about or depend on what happens in these various Shell plugins as long as they fulfil their contracts and hand back Vault references, or Content Resource objects, depending on what kind of operation has been invoked.
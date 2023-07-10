The App is everything below the [[Shell]] top bar.

The App's job is to modify the IIIF resource loaded in Vault, but not to Load or Save it, or [[Preview]] it, or export it.
It's also not the App's job to obtain _other_ IIIF resources, for inclusion in the current IIIF resource; it can let the Shell handle that through its [[Import|Import of IIIF Resources]] facility.
However, unlike load/save, an App obtaining its own references to external IIIF and putting them in Vault itself is not disallowed - this might suit some Apps (e.g., [[Sorting Room]] might want to present a different kind of source view inside the App panel and allow drag and drop). This is OK because they are all external - The Undo stack does not apply to them, they aren't being loaded or saved.

![App vs Shell](https://user-images.githubusercontent.com/1443575/151580517-d69ee3dd-c6b8-4814-8d67-923b3130836e.png)

Apps can trigger plugins to appear in the shell components _(can they?)_, and enable or disable menu items.

[[Configuration]] of the overall framework defines the initial App (and any others that are available) and the Shell components.

 - The Shell gives the App a reference to the Vault.
 - The Shell also gives the App a Vault reference to the loaded IIIF resource (a Manifest... for now).
 - The App config _(or the app itself?)_ tells the Shell whether it can handle Undo/Redo (you are allowed to have Apps that don't do this, e.g., a quick and useful tool might not)
 - As the App modifies Vault, the Shell tracks the [[undo|Undo and Redo]] stack; if the user performs Undo/Redo operations in the Shell, the App should update the UI. NB the Shell is only modifying Vault resources for undo and redo, it doesn't know what the App is doing with that state, how it's bound to the UI.
 - The App doesn't need to worry about stopping the user losing their work by Loading something new without saving; that's the Shell's job.
 - Apps don’t manage the Vault, they use shell’s Vault; they have a reference to it and use it to update the current Manifest (or other resource).
 - The thing being edited in the App is usually a Manifest, but you could have a Collection editor App. For this reason the App needs to tell the Shell the `type` of resource that can be Loaded. You can't load a Manifest into the Collection editor App (though you can obviously browse and select manifests... using Shell's facilities).

You can switch apps without the shell losing the thing being edited - as long as it's an editor for the same `type` of resource. So if you switch from the main Manifest Editor to a Range editor, nothing special happens - Shell's Vault has the state, Shell's Vault is where the Manifest actually lives. But if you switched from a Manifest Editor to a Collection Editor, and there are unsaved changes, Shell would prompt you to Save first, and not pass the manifest reference to the Collection editor.


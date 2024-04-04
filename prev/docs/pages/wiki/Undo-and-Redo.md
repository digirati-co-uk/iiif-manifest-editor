(WIP)

The Shell manages Undo and Redo - rolls Vault back (or forward); Apps can respond to this by updating their UI.

The App config (or the app itself?) tells the Shell whether it can handle Undo/Redo (you are allowed to have Apps that don't do this, e.g., a quick and useful tool might not)

As the App modifies Vault, the Shell tracks the undo stack; if the user performs Undo/Redo operations in the Shell, the App should update the UI. NB the Shell is only modifying Vault resources for undo and redo, it doesn't know what the App is doing with that state, how it's bound to the UI.

Not all possible apps need to support undo

Note from Stephen:

I thought about this too. All of vaults mutations are funnelled through a single point. It looks like this:

```
{ pathToThing: ['Manifest', 'http://example.org/manifest', 'label'], newValue: {en: ['New Label']} }
```

In order to support an undo-redo stack, the shell can listen for those ^ objects coming through and store:

```
{ pathToThing: ['Manifest', 'http://example.org/manifest', 'label'], newValue: {en: ['New Label']}, oldValue: {en: ['Old label']} } <-- this being added
```

So that each action becomes reversible.

tomcrane  4:16 PM
yeah - and the app (e.g., manifest editor, range editor) is responsible for reacting to changes.
Crucially - the Shell is actually MODIFYING THE IIIF - which should make it eas(ier) in theory for an app to support undo
It just needs to update its UI

stephen  4:17 PM
Yeah, and with React integrations, updating is fairly automatic

tomcrane  4:17 PM
e.g., re-bind the tree, re-draw canvas

stephen  4:17 PM
There is a catch.
A single user action might update 3-4 things in Vault

tomcrane  4:17 PM
Yeah, I guessed it would need to be "batched" somehow
granular jumps

stephen  4:18 PM
yeah, ideally that would be supported at the lowest level (lower than vault) so when you batch it will also only notify subscribers once

tomcrane  4:18 PM
(also better UX rather than have to press undo hundreds of times) (edited) 
Even a word processor for example might not undo every keypress

stephen  4:19 PM
yeah, and gives the apps some control over what an undo should do
Where undo/redo gets potentially complicated is 2 apps changing the same part of the state. We either undo to a state the app might be be expecting (from the other app) or prevent undo - since the last change wasn’t “owned” by the app
With the latter, apps could have their own undo/redo stack
which would be nice

tomcrane  4:22 PM
Although, initially here - only one app in shell at a time, so only one thing can possibly update state
And because it's in Shell you could even undo across apps...
which might get interesting

stephen  4:23 PM
we could add changing of app to the stack?

tomcrane  4:23 PM
yes I guess you would also need that UI-only change
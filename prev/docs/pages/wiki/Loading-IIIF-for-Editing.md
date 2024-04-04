In the [[Shell]], when the user goes to Open a IIIF Manifest - File -> open => browse something...

![File -> Open](https://user-images.githubusercontent.com/1443575/151701626-2eaad193-ae4d-4ceb-b521-97316ddd6dc5.png)

...they enter an _extension point_ of the [[Shell]]. The job of this extension point is to return a Vault reference to a IIIF resource - i.e., this extension does the loading and putting into Vault.

Design question - is this a modal dialogue? Or is it a panel? If the [[Shell]] design confines Shell UI to a top bar, it can't be a panel somewhere below that. But it can (in fact must, in this case) be a modal overlay. But if the Shell includes a side panel, it could be there. It’s distinct and encapsulated, anyway.

_(I lean towards the modal, to keep the Shell confined to the top and allow maximum freedom for [[Apps|app]] design)._

In fact, there are two layers of extension here, and therefore a further design question.
File->Open is not as simple as a desktop app. There are many sources the user could open a manifest from.

## Choice of sources

There is a CHOICE between sources, which include any of:

 - Paste / drop a URL
 - Browse the Manifest Editor's “iiif universe” equivalent
 - Browse GitHub
 - Browse the local file system
 - Plugin(s) that adopters implement to browse their own repositories, image servers etc.

Design: This could be tabbed, or a linear sequence of different load locations - a long page-style presentation with navigation links. Some configurations could have 3-4 possible sources for loading.

A "Plugin" might be just a particular start point for iiif-universe (e.g., institutional endpoint) and it otherwise behaves identically to the default version, or it could be a [[GitHub Integration]] - you see your repositories (or the last repository you were in when you opened the tool), you can navigate to other repositories) - or it could be a customisable widget; its job is to yield a Vault reference back to the Shell, for the Shell to make available to apps. It also (as per the UXPin) remembers recent manifests (from whatever source) and lists them for convenience. The recent list is therefore yet another source.

This means the extension point is not what you get when you perform File -> Open, because Shell is still managing that. The extension *points* are the tabs (or panels, or sections), which are set in config. Manifest Editor comes with a few; you can turn some off, and add your own.

## Types of Source

> **The Contract of the Open dialog is to load a manifest into the Vault instance it shares with the editor and pass a ref to the manifest back to the Shell.**

* Model 0: You must supply a IIIF URL, or drag JSON onto the control (see UXPin). There's nothing to browse, you have to know where it is already, by https URL.
* Model 1: The same as 0 but also, using the [[IIIF Browser]], you can browse IIIF collections as well as directly enter a URL. Out of the box we provide two collections as entry points. One is in the manifest editor repo and is a curated version of IIIF Universe that excludes collections that have enormous collections that don't work in a UI (cough... Wellcome... we can fix that though). The other is a IIIF Collection for the Cookbook, maintained by Glen.
* Model 1a: An adopter provides a top level entry point (IIIF collection) of their own, in addition to or instead of the two above. This is a much easier integration that building your own Load widget, you just need to implement this on the Server. NB we could provide a docker image that does this over S3 (and also allows [[Saving IIIF]]).
* Model 2: Github integration (with hosted bridge): Browse repositories, load and save from repositories by committing.
* Model 3: Local file system - see https://googlechromelabs.github.io/text-editor/ This is OK for loading, but harder (impossible, usually) to save back.

## More design notes

Our out of the box implementation of this component might be tabbed - but we don't know how many tabs there might be. 

Recent | Browse | GitHub | Cookbook

We'll implement Model 0, 1, 1a, and we hope, 2 (GitHub). Others could add more in their own implementations.

Cookbook is just the browse menu but opening on the cookbook collection (or option on browse? Multiple top levels? Config sets 2 top levels
Browse is the default content state selector - you can configure it to start somewhere else, by default it starts at our custom iiif universe. 

In [[Configuration]] we set which options are visible, and which components/plugins are responsible. (TODO)
If you implement your own tab here, you put the class reference here (?)

Your tab could be VERY different - e.g., browse a Content Management System, browse MediaWiki for artworks... 
You could add more than tab of your own



When the user wishes to edit IIIF Ranges, they switch to a different [[app|Apps]] without leaving the outer [[shell|Shell]]. This doesn't feel like changing applications; it's more like changing tools within one application. They don't need to save their work in one tool and open it in another; the outer [[Shell]] is what holds the work in progress, the state is completely maintained. 

In fact the design of apps, and their influence on the Shell's menus, should encourage this seamless perception. From a technical point of view, and for thinking about adding new capabilities to the app _framework_, they are distinct apps, but to the user they are different views of the IIIF resource currently being edited.

Initially the Range Editor is a tool for simple allocation of canvases to ranges, appropriate for tasks such as creating a table of contents. This is a specifically image-based mode.

Its job is to present an overview of the canvases so that they can be allocated to ranges. Its UI is not cluttered with content creation of canvas editing controls.

Later, there can be other Range Editor apps, suited to different types of content. For example, a Range Editor similar to the [IIIF Timeliner](https://github.com/digirati-co-uk/timeliner), for structuring Audio; or a video-centric range tool for marking out scenes.



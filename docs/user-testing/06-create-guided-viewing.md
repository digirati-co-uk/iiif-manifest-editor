## Test 6: Creating a guided viewing experience

The goal of this test is to create a Manifest that targets a custom viewing experience rather than a standard IIIF viewer.

In this case the result will be a tour of an ocean liner.

## Material and requirements

Links to an image service and HTML for the parts of the tour are provided below.

The Manifest Editor needs to be configured with a non-standard preview environment called "Ocean Liners".

> Note: in a later version of this test, the input field will be a WYSIWYG editor, so you won't be entering HTML directly.

## 1. Create a blank Manifest

Open the Manifest Editor and start a new Manifest from the Blank template.

Give the Manifest a Label of "Ocean Liners" and set the language to English.

## 2. Add the single Canvas

Create a new Canvas from this IIIF Image Service URL:

https://framemark.vam.ac.uk/collections/2013GU2911/info.json

## 3. Create the annotations

Now you will create the points of interest by drawing boxes on the canvas.
The box defines the region of the image that you want to be visible when the user moves from annotation to annotation in the story.

Each of the following annotations should have the motivation `describing`, and the body of the annotation should be a **TextualBody**.

The body content for each annotation is given below in section 5, as HTML that you can copy and paste into the editor.

Can you see how to create annotations that meet these requirements?

This picture will help you place the annotations in the correct places:

![Ocean Liners Guide](06-ocean-liners-guide.png)

Add the first annotation and then preview the Manifest in the Ocean Liners preview.

Continue previewing as you go along.

## 4. Comments

Were you able to create this guided viewing experience?


## 5. Appendix - HTML for the annotation bodies

### 1. First-class lounge

```html
<h2>First-class lounge</h2>
<div><img src="https://media.vam.ac.uk/feature/annotatedzoom/O1023003/Aquitania-lounge-drawing-room-cropped.jpg" width=300 height=250/>
    <p>First-class public rooms were located in the centre of the ship — the most stable and comfortable areas on board. The <i>Aquitania</i>'s opulent interiors were inspired by classical architecture &ndash; spot the Ionic columns in the lounge. Architect
        Arthur Davis recommended the use of plaster and papier-mâché for ceilings, domes, and other decorative moulding, but advised against using marble and brickwork, as these would make the ship top-heavy.</p>
    <p class="credit">Photograph from <em>The New Art of Going Abroad</em>, 1929, US. National Art Library: 38041986015030. © Victoria and Albert Museum, London</p>
</div>
```

### 2. Garden lounge

```html
<h2>Garden lounge</h2>
<div><img src="https://media.vam.ac.uk/feature/annotatedzoom/O1023003/2017KE6202-Aquitania-Garden-Lounge-cropped.jpg" width=300 height=250/>
    <p>“As cool, as restful, as any terrace overlooking a rose-garden.” (<i>The New Art of Going Abroad</i>, 1929). Overlooking the sea and decorated with palms, the garden lounge was a fashionable place to have tea and was sometimes used for dancing.</p>
    <p class="credit">Photograph from <em>The New Art of Going Abroad</em>, 1929, US. National Art Library: 38041986015030. © Victoria and Albert Museum, London</p>
</div>
```

### 3. First-class restaurant

```html
<h2>First-class restaurant</h2>
<div><img src="https://media.vam.ac.uk/feature/annotatedzoom/O1023003/2017KE6204-Aquitania-restaurant-cropped.jpg" width=300 height=250/>
    <p>Dining on ocean liners was a radically different experience depending on the class of travel. In first class, the <i>Aquitania</i>'s Louis XVI-style dining room offered seating in small isolated groups, echoing elegant restaurants on land. The
        ship's architect, Arthur Davis, explained that a “cheerful room with comfortable surroundings” was a necessary distraction from “the often very unpleasant conditions” at sea. </p>
    <p class="credit">Photograph from <em>The New Art of Going Abroad</em>, 1929, US. National Art Library: 38041986015030. © Victoria and Albert Museum, London</p>
</div>
```

### 4. First-class state room

```html
<h2>First-class state room</h2>
<div><img src="https://media.vam.ac.uk/feature/annotatedzoom/O1023003/2017KE6205-state-rooms-on-B-deck-+-D-deck-cropped.jpg" width=300 height=250/>
    <p>The <i>Aquitania</i>'s first-class cabins were designed by architect Arthur Davis, whose firm, Mewès and Davis Architects, had decorated the famously opulent Ritz hotels in Paris and London. The cabins were “as spacious as a bedroom at the Ritz
        or the Barclay. The walls are panelled in grey silk. The carpets are vibrant blue and yellow, as are also the striped silk chair coverings. Note the bath — just off-stage, and the electric heater”. (<i>The New Art of Going Abroad</i>, 1929).
    </p>
    <p class="credit">Photograph from <em>The New Art of Going Abroad</em>, 1929, US. National Art Library: 38041986015030. © Victoria and Albert Museum, London</p>
</div>
```

### 5. Third-class dining saloon

```html
<h2>Third-class dining saloon</h2>
<div>
    <p>While extravagant dishes and refined delicacies were served in first class, third-class meals were less sophisticated. A third-class lunch on a Cunard ship in the 1920s could include rice soup, boiled haddock or braised beef with cabbage, boiled
        potatoes, bread and 'cabin biscuits', followed by bread and butter pudding. To save space, passengers sat at long communal tables on chairs bolted to the floor, in case of bad weather.</p>
</div>
```

### 6. Third-class four berth room

```html
<h2>Third-class four berth room</h2>
<div>
    <p>Liners were strictly organised spaces which reflected social hierarchies. Although people travelling in third class could account for 60% of the total number of passengers, they were segregated into a relatively small space in the lower decks
        of the ship, close to the noisy engine room. These four-berth rooms had none of the luxurious furnishings or fabrics found in first class, but they were an improvement on the communal sleeping quarters provided for steerage-class passengers
        on earlier liners.</p>
</div>
```

### 7. Boiler room

```html
<h2>Boiler room</h2>
<div>
    <p>In 1919 the <i>Aquitania</i> was refitted and converted from coal-burning to oil-burning engines, which meant fewer crew were required to labour in the engine room.</p>
</div>
```

### 8. Stores

```html
<h2>Stores</h2>
<div>
    <p>Ocean liners required huge quantities of food, enough for all crew and passengers — the equivalent to feeding a floating city. Cunard catered for varied tastes. Provisions for one trip included 500 sheep kidneys, 400 ox tails, 800 tongues and
        large quantities of frogs' legs, as well as geese, turkey, duck, game and “75 heads of cattle and calfs”.</p>
</div>
```

### 9. Baggage

```html
<h2>Baggage</h2>
<div>
    <p>Passengers travelling for weeks or months would bring a huge number of trunks, most of which were kept in the baggage store deep in the hull of the ship. Cabins could only accommodate smaller trunks. Louis Vuitton designed the 'steamer trunk'
        specifically to fit under a first-class cabin bed. The baggage store was opened daily so that maids or stewards could collect personal items that were needed during the voyage.</p>
</div>
```

### 10. Second-class dining saloon

```html
<h2>Second-class dining saloon</h2>
<div>
    <p>The second-class spaces, like first class, were decorated in a neo-classical style. “The second-class accommodation on the vessel, though not so sumptuous as the first-class, is still very elaborate and comfortable”, explained the architect. “The
        dining-room, no less than 104 ft in length and extending across the whole width of the ship, is decorated with paintings adapted from panels by Pergolesi”— the 18th-century decorative artist. (Arthur Davis,
        <i>The Architectural Review</i>, April 1914)</p>
</div>
```

<!-- https://stephenwf.github.io/ocean-liners.json -->

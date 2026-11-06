/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Sammlung",
    manifest: "Manifest",
    canvas: "Canvas",
    annotation: "Anmerkung",
    annotationPage: "Anmerkungsseite",
    range: "Bereich",
    annotationCollection: "Anmerkungssammlung",
    contentResource: "Inhaltsressource",
    agent: "Agent",
  },
  layout: {
    pair: "Nebeneinander",
    triptych: "Drei Spalten",
    featureLeft: "Funktion übrig",
    featureAbove: "Funktion oben",
    fourImages: "Vier Bilder",
    sixImages: "Sechs Bilder",
    heroInset: "Held + Einschub",
    offsetPair: "Offset-Paar",
    cascade: "Kaskade",
    stacked: "Gestapelt",
    scatter: "Streuen",
    galleryWall: "Galeriewand",
    blank: "Leere Leinwand",
  },
  fields: {
    label: "Bezeichnung",
    metadata: "Metadaten",
    summary: "Zusammenfassung",
    requiredStatement: "Pflichtangabe",
    rights: "Rechte",
    provider: "Anbieter",
    thumbnail: "Miniaturansicht",
    navDate: "Navigationsdatum",
    placeholderCanvas: "Platzhalter-Leinwand",
    accompanyingCanvas: "Begleitende Leinwand",
    language: "Sprache",
    id: "Kennung",
    type: "Typ",
    format: "Format",
    profile: "Profil",
    height: "Höhe",
    width: "Breite",
    duration: "Dauer",
    viewingDirection: "Blickrichtung",
    behavior: "Verhalten",
    timeMode: "Zeitmodus",
    motivation: "Motivation",
    homepage: "Homepage",
    logo: "Logo",
    rendering: "Alternative Darstellung",
    service: "Service",
    services: "Dienstleistungen",
    seeAlso: "Verwandte Beschreibung",
    partOf: "Teil von",
    start: "Startleinwand",
    supplementary: "Ergänzende Inhalte",
    items: "Artikel",
    structures: "Strukturen",
    annotations: "Anmerkungen",
    target: "Ziel",
    body: "Körper",
    navPlace: "Navigationsort",
    textGranularity: "Textgranularität",
    value: "Wert",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Eine geordnete Liste von Manifesten und/oder weiteren Sammlungen. Sammlungen ermöglichen die Gruppierung von Manifesten und untergeordneten Sammlungen in einer hierarchischen Struktur zur Präsentation, die der Generierung einer Navigation, der Anzeige dynamischer Ergebnisse einer Suche oder der Bereitstellung fester Sätze verwandter Ressourcen für andere Zwecke dienen kann.",
      Manifest:
        "Eine Beschreibung der Struktur und Eigenschaften des zusammengesetzten Objekts. Es enthält Informationen, die der Kunde benötigt, um dem Benutzer den Inhalt zu präsentieren, beispielsweise einen Titel und andere beschreibende Informationen über das Objekt oder die geistige Arbeit, die es vermittelt. Jedes Manifest beschreibt normalerweise, wie ein einzelnes zusammengesetztes Objekt wie ein Buch, eine Statue oder ein Musikalbum präsentiert wird.",
      Canvas:
        "Ein virtueller Container, der eine bestimmte Ansicht des Objekts darstellt und mit ihm oder Teilen davon verknüpfte Inhaltsressourcen aufweist. Die Leinwand bietet einen Bezugsrahmen für die räumliche und zeitliche Gestaltung des Inhalts. Das Konzept einer Leinwand ist von Standards wie PDF und HTML oder Anwendungen wie Photoshop und PowerPoint entlehnt, bei denen auf eine zunächst leere Anzeigeoberfläche Bilder, Videos, Text und andere Inhalte von Annotations „gemalt“ werden, die in Annotation Pages gesammelt werden.",
      Range:
        "Eine geordnete Liste von Leinwänden und/oder weiteren Bereichen. Mithilfe von Bereichen können Leinwände oder Teile davon auf irgendeine Weise gruppiert werden. Dies kann inhaltliche Gründe haben, wie sie beispielsweise in einem Inhaltsverzeichnis oder in den Szenen eines Theaterstücks beschrieben werden. Ebenso können physische Merkmale wichtig sein, wie z. B. Seitenzusammenstellungen in einem frühen Buch oder wenn aufgenommene Musik auf verschiedene physische Träger, wie z. B. zwei CDs, aufgeteilt wird.",
      AnnotationPage:
        "Eine geordnete Liste von Anmerkungen, die normalerweise einem Canvas zugeordnet ist, auf die aber auch von anderen Ressourcentypen verwiesen werden kann. Anmerkungsseiten sammeln und ordnen Listen von Anmerkungen, die wiederum Kommentare zu einer Ressource oder einem Inhalt liefern, der Teil eines Canvas ist.",
      Annotation:
        "Anmerkungen verknüpfen Inhaltsressourcen mit Canvases. Für die sichtbaren und/oder hörbaren Ressourcen wird derselbe Mechanismus verwendet wie für Transkriptionen, Kommentare, Tags und andere Inhalte. Dies bietet eine einzige, einheitliche Methode zum Ausrichten von Informationen und einen auf Standards basierenden Rahmen zur Unterscheidung von Teilen von Ressourcen und Teilen von Canvases. Da Anmerkungen später hinzugefügt werden können, fördert es ein verteiltes System, in dem Herausgeber ihre Inhalte an den von anderen erstellten Beschreibungen ausrichten können. Annotationsbezogene Funktionen können auch auf weitere Klassen wie SpecificResource, Choice oder Selectors zurückgreifen.",
      ContentResource:
        "Webressourcen wie Bilder, Audio, Video oder Text, die über eine Anmerkung mit einem Canvas verknüpft sind oder eine Darstellung einer beliebigen Ressource bereitstellen.",
      AnnotationCollection:
        "Eine geordnete Liste von Anmerkungsseiten. Anmerkungssammlungen ermöglichen die Aufzeichnung von Gruppierungen von Anmerkungen auf höherer Ebene. Beispielsweise könnten alle Anmerkungen zur englischen Übersetzung eines mittelalterlichen französischen Dokuments von der Transkription oder einer Ausgabe in modernem Französisch getrennt gehalten werden, oder der Kommentar des Regisseurs zu einem Film kann vom Drehbuch getrennt werden.",
    },
    descriptive: {
      label:
        "Eine für Menschen lesbare Bezeichnung, ein Name oder ein Titel. Die Beschriftungseigenschaft soll als kurzer Textersatz für die Ressource angezeigt werden, wenn ein Mensch zwischen ihr und ähnlichen Ressourcen unterscheiden muss, beispielsweise zwischen Objekten, Seiten oder Optionen für eine Auswahl an anzuzeigenden Bildern. Die Label-Eigenschaft kann vollständig internationalisiert werden und jede Sprache kann mehrere Werte haben.",
      metadata:
        "Eine geordnete Liste von Beschreibungen, die dem Benutzer angezeigt werden, wenn er mit der Ressource interagiert, bereitgestellt als Paare von für Menschen lesbaren Beschriftungs- und Werteinträgen. Der Inhalt dieser Einträge dient lediglich der Präsentation; Eine beschreibende Semantik sollte nicht abgeleitet werden. Ein Eintrag kann verwendet werden, um Informationen über die Entstehung des Objekts, eine physische Beschreibung, Eigentumsinformationen oder andere Zwecke zu übermitteln.",
      summary:
        "Eine kurze Textzusammenfassung, die dem Benutzer übermittelt werden soll, wenn die Metadateneinträge für die Ressource nicht angezeigt werden. Dies könnte als Kurzbeschreibung für Suchergebnisse auf Elementebene, für Umgebungen mit kleinen Bildschirmen oder als alternative Benutzeroberfläche verwendet werden, wenn die Metadateneigenschaft derzeit nicht gerendert wird. Die Eigenschaft summary folgt demselben Muster wie die oben beschriebene Eigenschaft label.",
      requiredStatement:
        "Text, der angezeigt werden muss, wenn die Ressource angezeigt oder verwendet wird. Beispielsweise könnte die requiredStatement-Eigenschaft verwendet werden, um Urheberrechts- oder Eigentumserklärungen, eine Anerkennung der besitzenden und/oder veröffentlichenden Institution oder jeden anderen Text darzustellen, dessen Anzeige für den Benutzer für die veröffentlichende Organisation von entscheidender Bedeutung ist. Angesichts der großen Vielfalt potenzieller Client-Benutzeroberflächen wird es nicht immer möglich sein, diese Anweisung dem Benutzer im Ausgangszustand des Clients anzuzeigen. Wenn es zunächst verborgen bleibt, müssen Kunden die Methode zur Offenlegung so offensichtlich wie möglich gestalten.",
      rights:
        "Eine Zeichenfolge, die eine Lizenz- oder Rechteerklärung identifiziert, die für den Inhalt der Ressource gilt, z. B. JSON eines Manifests oder die Pixel eines Bildes. Der Wert muss aus dem Satz der Creative Commons-Lizenz-URIs, den RightsStatements.org-Rechteerklärungs-URIs oder den über den Erweiterungsmechanismus hinzugefügten URIs entnommen werden. Die Einbeziehung dieser Eigenschaft ist informativ und könnte beispielsweise verwendet werden, um ein Symbol anzuzeigen, das die Rechteansprüche darstellt.",
      provider:
        "Eine Organisation oder Person, die zur Bereitstellung des Inhalts der Ressource beigetragen hat. Clients können diese Informationen dann dem Benutzer anzeigen, um die Beiträge des Anbieters zu bestätigen. Dies unterscheidet sich von der requiredStatement-Eigenschaft dadurch, dass die Daten strukturiert sind, sodass der Client mehr tun kann, als nur Text darzustellen, sondern über umfangreichere Informationen über die Personen und Organisationen verfügt, die er in verschiedenen Schnittstellen verwenden kann.",
      thumbnail:
        "Eine Inhaltsressource, beispielsweise ein kleines Bild oder ein kurzer Audioclip, die die Ressource mit der Miniaturbildeigenschaft darstellt. Eine Ressource kann über mehrere Miniaturansicht-Ressourcen verfügen, die denselben oder einen unterschiedlichen Typ und Format haben.",
      navDate:
        "Ein Datum, das Clients zu Navigationszwecken verwenden können, wenn sie dem Benutzer die Ressource in einer datumsbasierten Benutzeroberfläche wie einem Kalender oder einer Zeitleiste präsentieren. Aussagekräftigere Datumsbereiche, die dem Benutzer direkt angezeigt werden sollen, sollten in die Metadateneigenschaft für den menschlichen Gebrauch aufgenommen werden. Wenn die Ressource Canvases mit der Dauereigenschaft enthält, entspricht die angegebene Datums- und Uhrzeitangabe der Navigations-Datums- und Uhrzeitangabe des Starts der Ressource. Wenn es sich beispielsweise um einen Bereich handelt, der eine Leinwand enthält, die eine Reihe von Videoinhalten darstellt, die ein historisches Ereignis aufzeichnen, ist navDate das Datum und die Uhrzeit des ersten Moments des aufgezeichneten Ereignisses.",
      placeholderCanvas:
        "Ein einzelner Canvas, der zusätzlichen Inhalt zur Verwendung bereitstellt, bevor der Hauptinhalt der Ressource mit der placeholderCanvas-Eigenschaft gerendert wird, oder als Werbung oder Ersatz für diesen Inhalt. Beispiele hierfür sind Bilder, Text und Ton, die den Videoinhalt ersetzen, bevor der Benutzer die Wiedergabe startet; oder ein Filmplakat, um die Aufmerksamkeit des Benutzers zu erregen. Der von placeholderCanvas bereitgestellte Inhalt unterscheidet sich von einer Miniaturansicht: Ein Client verwendet möglicherweise eine Miniaturansicht, um mehrere Ressourcen zusammenzufassen und durch sie zu navigieren, und zeigt dann Inhalte von placeholderCanvas als Teil der ersten Präsentation einer einzelnen Ressource an. Ein Platzhalter-Canvas hat wahrscheinlich andere Abmessungen als die Canvas(es) der Ressource, die über die Eigenschaft placeholderCanvas verfügt.",
      accompanyingCanvas:
        "Ein einzelner Canvas, der zusätzlichen Inhalt zur Verwendung beim Rendern der Ressource bereitstellt, die über die Eigenschaft accompanyingCanvas verfügt. Beispiele hierfür sind ein Bild, das angezeigt wird, während ein Canvas nur für die Dauer Audio abspielt; oder Hintergrundaudio, das abgespielt wird, während ein Benutzer durch ein Nur-Bild-Manifest navigiert.",
      language:
        "Die im Inhalt dieser externen Ressource verwendete(n) Sprache(n). Diese Eigenschaft ist im Web Annotation-Modell bereits für Inhaltsressourcen verfügbar, die den Hauptteil oder das Ziel einer Annotation darstellen. Sie kann jedoch auch für Ressourcen verwendet werden, auf die von der Homepage, dem Rendering und partOf verwiesen wird.",
    },
    technical: {
      id: "Der URI, der die Ressource identifiziert. Wenn die Ressource nur eingebettet in eine andere Ressource verfügbar ist, beispielsweise in einen Bereich innerhalb eines Manifests, kann URI der URI der einbettenden Ressource mit einem eindeutigen Fragment am Ende sein. Dies gilt nicht für Canvases, die über ein eigenes URI ohne Fragment verfügen müssen.",
      type: "Der Typ oder die Klasse der Ressource. Für für diese Spezifikation definierte Klassen",
      format:
        "Der spezifische Medientyp (häufig als MIME-Typ bezeichnet) für eine Inhaltsressource, zum Beispiel Bild/JPEG. Dies ist wichtig, um verschiedene Formate desselben Gesamtressourcentyps zu unterscheiden, z. B. um Text in XML von reinem Text zu unterscheiden.",
      profile:
        "Ein Schema oder benannter Funktionssatz, der von der Ressource verfügbar ist. Das Profil kann den Typ und/oder das Format einer externen Ressource oder eines externen Dienstes weiter verdeutlichen, sodass Kunden ihre Handhabung der Ressource, die über die Profileigenschaft verfügt, individuell anpassen können.",
      height:
        "Die Höhe des Canvas oder der externen Inhaltsressource. Bei Inhaltsressourcen wird der Wert in Pixel angegeben. Für Canvases hat der Wert keine Einheit. In Kombination mit der Breite vermittelt es ein Seitenverhältnis für den Raum, in dem sich Inhaltsressourcen befinden.",
      width:
        "Die Breite des Canvas oder der externen Inhaltsressource. Bei Inhaltsressourcen wird der Wert in Pixel angegeben. Für Canvases hat der Wert keine Einheit. In Kombination mit der Höhe vermittelt es ein Seitenverhältnis für den Raum, in dem sich Inhaltsressourcen befinden.",
      duration: "Die Dauer der Canvas- oder externen Inhaltsressource, angegeben in Sekunden.",
      viewingDirection:
        "Die Richtung, in der dem Benutzer eine Reihe von Canvases angezeigt werden sollen. Diese Spezifikation definiert vier Richtungswerte in der folgenden Tabelle. Andere können extern als Erweiterung definiert werden.",
      behavior:
        "Eine Reihe von Benutzererfahrungsfunktionen, die der Herausgeber des Inhalts gerne vom Kunden bei der Präsentation der Ressource verwenden würde. Diese Spezifikation definiert die Werte in der folgenden Tabelle. Andere können extern als Erweiterung definiert werden.",
      timeMode:
        "Ein mit einer Annotation verknüpfter Modus, der auf die Darstellung zeitbasierter Medien angewendet werden soll oder auf andere Weise als eine Dauer angesehen werden könnte, die als Hauptressource dieser Annotation verwendet wird. Beachten Sie, dass die Zuordnung von timeMode zur Annotation bedeutet, dass verschiedene Ressourcen im Körper keine unterschiedlichen Werte haben können. Diese Spezifikation definiert die in der folgenden Tabelle angegebenen Werte. Andere können extern als Erweiterung definiert werden.",
      motivation:
        "Diese Spezifikation definiert zwei Werte für die Web-Annotation-Eigenschaft „Motivation“ oder „Zweck“, wenn sie für eine bestimmte Ressource oder Textual Body verwendet wird. Ressourcen, die einem Canvas durch eine Annotation mit dem Motivationswert „painting“ zugeordnet sind, müssen dem Benutzer als Darstellung des Canvas präsentiert werden. Ressourcen, die einem Canvas durch eine Annotation mit dem Motivationswert supplementing zugeordnet sind, können dem Benutzer als Teil der Darstellung des Canvas oder in einem anderen Teil der Benutzeroberfläche präsentiert werden.",
    },
    linking: {
      homepage:
        "Eine Webseite, die sich mit dem Objekt befasst, das durch die Ressource dargestellt wird, die über die Homepage-Eigenschaft verfügt. Die Webseite wird normalerweise von der für das Objekt verantwortlichen Organisation veröffentlicht und kann von einem Content-Management-System oder einem anderen Katalogisierungssystem generiert werden. Die Ressource muss dem Benutzer direkt angezeigt werden können. Ressourcen, die miteinander in Beziehung stehen, aber keine Homepages, müssen stattdessen der Metadateneigenschaft mit einer entsprechenden Bezeichnung oder einem entsprechenden Wert zur Beschreibung der Beziehung hinzugefügt werden.",
      logo: "Eine kleine Bildressource, die die Agent-Ressource darstellt, mit der sie verknüpft ist. Das Logo muss deutlich erkennbar sein, wenn die Ressource angezeigt oder verwendet wird, ohne das Bild zu beschneiden, zu drehen oder anderweitig zu verzerren. Es wird empfohlen, dass für dieses Bild ein IIIF-Bild-API-Dienst für andere Manipulationen wie etwa die Größenänderung verfügbar ist.",
      rendering:
        "Eine Ressource, die eine alternative, nicht-IIIF-Darstellung der Ressource ist, die über die Rendering-Eigenschaft verfügt. Solche Darstellungen können normalerweise nicht auf eine einzelne Leinwand gemalt werden, da sie entweder zu viele Ansichten umfassen, inkompatible Abmessungen haben oder zusammengesetzte Ressourcen sind, die zusätzliche Rendering-Funktionen erfordern. Die Rendering-Ressource muss einem menschlichen Benutzer direkt angezeigt werden können, obwohl die Präsentation möglicherweise außerhalb des IIIF-Clients erfolgt. Die Ressource darf keine Splash-Seite oder andere Interstitial-Ressource haben, die den Zugriff darauf vermittelt. Wenn eine Zugriffskontrolle erforderlich ist, wird die IIIF-Authentifizierungs-API empfohlen. Beispiele hierfür sind die Darstellung eines Buches als PDF oder EPUB, ein Diadeck mit Bildern eines Gebäudes oder ein 3D-Modell einer Statue.",
      service:
        "Ein Dienst, mit dem der Client möglicherweise direkt interagiert und zusätzliche Informationen oder Funktionen für die Verwendung der Ressource mit der Diensteigenschaft erhält, z. B. von einem Image zum Basis-URI eines zugeordneten IIIF-Image-API-Dienstes. Der Serviceressource sollten zusätzliche Informationen zugeordnet sein, damit der Kunde entscheiden kann, wie er sie angemessen nutzen kann. Einzelheiten zu derzeit bekannten Diensttypen finden Sie im Service Registry-Dokument.",
      services:
        "Eine Liste einer oder mehrerer Dienstdefinitionen auf der obersten Ressource des Dokuments, die normalerweise von mehr als einer nachfolgenden Ressource gemeinsam genutzt werden. Dadurch können diese gemeinsam genutzten Dienste an einem einzigen Ort gesammelt werden, anstatt dass ihre Informationen möglicherweise viele Male im gesamten Dokument dupliziert werden oder ein konsumierender Client die gesamte Dokumentstruktur durchsuchen muss, um die Informationen zu finden. Die Ressource, auf die der Dienst angewendet wird, muss weiterhin über die Diensteigenschaft verfügen, wie oben beschrieben, wobei die Dienstressourcen mindestens über die Eigenschaften id und type oder @id und @type verfügen. Dadurch kann der Client erkennen, dass der Dienst für diese Ressource gilt. Die Nutzung des Dienstleistungseigentums liegt im Ermessen des Verlagssystems.",
      seeAlso:
        "Eine maschinenlesbare Ressource wie eine XML- oder RDF-Beschreibung, die sich auf die aktuelle Ressource bezieht, die über die Eigenschaft seeAlso verfügt. Eigenschaften der Ressource sollten angegeben werden, um dem Kunden die Auswahl zwischen mehreren Beschreibungen (falls bereitgestellt) und die angemessene Nutzung des Dokuments zu erleichtern. Wenn die Beziehung zwischen der Ressource und dem Dokument spezifischer sein muss, sollte das Dokument diese Beziehung und nicht die IIIF-Ressource enthalten. Andere IIIF-Ressourcen sind ebenfalls gültige Ziele für seeAlso, beispielsweise um eine Verknüpfung zu einem Manifest herzustellen, das ein zugehöriges Objekt beschreibt. Der URI des Dokuments muss eine einzelne Darstellung der Daten in einem bestimmten Format identifizieren. Wenn beispielsweise in JSON und XML dieselben Daten vorhanden sind, sollten für jede Darstellung separate Ressourcen mit unterschiedlichen ID- und Formateigenschaften hinzugefügt werden.",
      partOf:
        "Eine enthaltende Ressource, die die Ressource enthält, die über die Eigenschaft partOf verfügt. Wenn ein Client auf die partOf-Eigenschaft stößt, ruft er möglicherweise die referenzierte enthaltende Ressource ab, wenn sie nicht in die aktuelle Darstellung eingebettet ist, um zur Verarbeitung der enthaltenen Ressource beizutragen. Beispielsweise kann die partOf-Eigenschaft auf einem Canvas verwendet werden, um auf ein externes Manifest zu verweisen, um die Entdeckung weiterer relevanter Informationen zu ermöglichen. Ebenso kann ein Manifest mithilfe von partOf auf eine enthaltende Sammlung verweisen, um die Navigation zu erleichtern.",
      start:
        "Ein Canvas oder Teil eines Canvas, den der Client bei der Initialisierung für die Ressource anzeigen soll, die über die Starteigenschaft verfügt. Der Verweis auf einen Teil eines Canvas wird auf die gleiche Weise gehandhabt wie Bereiche, die auf Teile eines Canvas verweisen. Diese Eigenschaft ermöglicht es dem Client, mit dem ersten Canvas zu beginnen, der interessante Inhalte enthält, ohne dass der Benutzer manuell navigieren muss, um ihn zu finden.",
      supplementary:
        "Ein Link von diesem Bereich zu einer Anmerkungssammlung, die die supplementing-Anmerkungen von Inhaltsressourcen für den Bereich enthält. Clients können dies verwenden, um dem Benutzer bei der Interaktion mit dem Bereich zusätzliche Inhalte von einem anderen Canvas anzuzeigen oder um zum nächsten Teil des Bereichs innerhalb desselben Canvas zu springen. Der Bereich könnte beispielsweise einen Zeitungsartikel darstellen, der sich über nicht aufeinanderfolgende Seiten erstreckt, und verwendet dann die ergänzende Eigenschaft, um auf eine Anmerkungssammlung zu verweisen, die aus den Anmerkungen besteht, die den Text aufzeichnen, aufgeteilt in Anmerkungsseiten pro Zeitungsseite. Alternativ könnte der Bereich die Teile eines Manuskripts darstellen, die transkribiert oder übersetzt wurden, während andere Teile noch bearbeitet werden müssen. Bei der Annotation Collection handelt es sich um die Annotationen, die jeweils transkribieren bzw. übersetzen.",
    },
    structural: {
      items:
        "Ein Großteil der Funktionalität der IIIF-Präsentations-API besteht lediglich darin, die Reihenfolge aufzuzeichnen, in der untergeordnete Ressourcen innerhalb einer übergeordneten Ressource vorkommen, wie z. B. Sammlungen oder Manifeste innerhalb einer übergeordneten Sammlung oder Canvases innerhalb eines Manifests. Alle diese Situationen werden mit einer einzigen Eigenschaft abgedeckt: Gegenständen.",
      structures:
        "Die Struktur eines als Manifest dargestellten Objekts kann mithilfe einer Hierarchie von Bereichen beschrieben werden. Bereiche können verwendet werden, um das „Inhaltsverzeichnis“ des Objekts oder anderer Strukturen zu beschreiben, mit denen der Benutzer über die durch die Items-Eigenschaft des Manifests vorgegebene Reihenfolge hinaus interagieren kann. Die Hierarchie wird durch die Verschachtelung der untergeordneten Range-Ressourcen im Item-Array des übergeordneten Ranges aufgebaut. Die Bereiche der obersten Ebene dieser Hierarchien werden in der Struktureigenschaft angegeben.",
      annotations:
        "Eine geordnete Liste von Anmerkungsseiten, die Kommentare oder andere Anmerkungen zu dieser Ressource enthalten, getrennt von den Anmerkungen, die zum Malen von Inhalten auf einer Leinwand verwendet werden. Die Motivation der Anmerkungen darf nicht painting sein und das Ziel der Anmerkungen muss diese Ressource oder einen Teil davon umfassen.",
    },
    attribution:
      "Copyright © 2012-2023 Herausgeber und Mitwirkende. Veröffentlicht vom IIIF-Konsortium unter der CC-BY-Lizenz, siehe Haftungsausschluss.",
  },
  behavior: {
    groups: {
      autoAdvance: "Automatischer Vorlauf",
      repeat: "Wiederholen",
      manifestOrdering: "Manifeste Reihenfolge",
      canvasOrdering: "Leinwandbestellung",
      collection: "Sammlung",
      range: "Bereich",
      collectionOrdering: "Abholbestellung",
      rangeOrdering: "Bereichsbestellung",
      hidden: "Sichtweite",
    },
    values: {
      "auto-advance": "Automatischer Vorlauf",
      "no-auto-advance": "Kein automatischer Vorlauf",
      repeat: "Wiederholen",
      "no-repeat": "Keine Wiederholung",
      unordered: "Ungeordnet",
      individuals: "Einzelne Leinwände",
      continuous: "Kontinuierlich",
      paged: "Ausgelagert",
      "facing-pages": "Gegenüberliegende Seiten",
      "non-paged": "Nicht ausgelagert",
      "multi-part": "Mehrteilig",
      together: "Zusammen",
      sequence: "Sequenz",
      "thumbnail-nav": "Miniaturnavigation",
      "no-nav": "Keine Navigation",
      hidden: "Versteckt",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Namensnennung – nicht kommerziell – keine Ableitungen",
      description:
        "Diese Lizenz ist die restriktivste unserer sechs Hauptlizenzen und erlaubt anderen nur, Ihre Werke herunterzuladen und mit anderen zu teilen, solange sie Sie nennen, sie dürfen sie jedoch in keiner Weise ändern oder kommerziell nutzen.",
    },
    attributionNonCommercialShareAlike: {
      label: "Namensnennung – nicht kommerziell – Weitergabe unter gleichen Bedingungen",
      description:
        "Mit dieser Lizenz können andere Ihre Arbeit nicht kommerziell remixen, anpassen und darauf aufbauen, sofern sie Sie nennen und ihre neuen Kreationen unter den gleichen Bedingungen lizenzieren.",
    },
    attributionNonCommercial: {
      label: "Namensnennung – nicht kommerziell",
      description:
        "Mit dieser Lizenz können andere Ihre Arbeit nicht kommerziell remixen, anpassen und darauf aufbauen. Auch wenn ihre neuen Werke Sie anerkennen und nicht kommerziell sein müssen, müssen sie ihre abgeleiteten Werke nicht zu denselben Bedingungen lizenzieren.",
    },
    attributionNoDerivs: {
      label: "Namensnennung-NoDerivs",
      description:
        "Diese Lizenz ermöglicht es anderen, das Werk für jeden Zweck, auch kommerziell, wiederzuverwenden; Eine Weitergabe an andere in angepasster Form ist jedoch nicht möglich, eine Quellenangabe ist erforderlich.",
    },
    attributionShareAlike: {
      label: "Namensnennung – Weitergabe unter gleichen Bedingungen",
      description:
        "Mit dieser Lizenz können andere Ihre Arbeit auch zu kommerziellen Zwecken remixen, anpassen und darauf aufbauen, sofern sie Sie nennen und ihre neuen Kreationen unter den gleichen Bedingungen lizenzieren. Diese Lizenz wird oft mit „Copyleft“-Lizenzen für freie und Open-Source-Software verglichen. Alle neuen Werke, die auf Ihrem Werk basieren, unterliegen der gleichen Lizenz, sodass etwaige Derivate auch eine kommerzielle Nutzung ermöglichen. Dies ist die von Wikipedia verwendete Lizenz und wird für Materialien empfohlen, die von der Einbindung von Inhalten aus Wikipedia und ähnlich lizenzierten Projekten profitieren würden.",
    },
    attribution: {
      label: "Namensnennung",
      description:
        "Mit dieser Lizenz können andere Ihr Werk vertreiben, remixen, anpassen und darauf aufbauen, auch kommerziell, sofern sie Ihnen die Urheberschaft für die Originalkreation nennen. Dies ist die anpassungsfähigste der angebotenen Lizenzen. Empfohlen für die maximale Verbreitung und Nutzung lizenzierter Materialien.",
    },
    publicDomain: {
      label: "Public Domain",
      description:
        "Die Person, die ein Werk mit dieser Urkunde verbunden hat, hat das Werk der Public Domain gewidmet, indem sie im gesetzlich zulässigen Umfang auf alle ihre Rechte an dem Werk weltweit nach dem Urheberrecht verzichtet, einschließlich aller verwandten und benachbarten Rechte.",
    },
  },
  sizes: {
    landscape: "12 × 8 · Landschaft",
    wide: "12 × 6 · Breit",
    square: "12 × 12 · Quadrat",
    portrait: "8 × 12 · Porträt",
  },
} as const;

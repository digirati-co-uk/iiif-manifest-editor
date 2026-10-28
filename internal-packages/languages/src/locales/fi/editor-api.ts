/** Generated translation draft; see translations/generated-languages.md before enabling. */
export const catalog = {
  resources: {
    collection: "Kokoelma",
    manifest: "Manifesti",
    canvas: "Kanvaasi",
    annotation: "Annotaatio",
    annotationPage: "Annotaatiosivu",
    range: "Alue",
    annotationCollection: "Annotaatiokokoelma",
    contentResource: "Sisältöresurssi",
    agent: "Agentti",
  },
  layout: {
    pair: "Rinnakkain",
    triptych: "Kolme saraketta",
    featureLeft: "Ominaisuus vasemmalla",
    featureAbove: "Ominaisuus yllä",
    fourImages: "Neljä kuvaa",
    sixImages: "Kuusi kuvaa",
    heroInset: "Hero + upote",
    offsetPair: "Offset-pari",
    cascade: "Kaskadi",
    stacked: "Pinottu",
    scatter: "Hajallaan oleva järjestely",
    galleryWall: "Gallerian seinä",
    blank: "Tyhjä kangas",
  },
  fields: {
    label: "Nimike",
    metadata: "Metatiedot",
    summary: "Yhteenveto",
    requiredStatement: "Pakollinen maininta",
    rights: "Oikeudet",
    provider: "Palveluntarjoaja",
    thumbnail: "Pikkukuva",
    navDate: "Navigointipäivämäärä",
    placeholderCanvas: "Paikkamerkkikangas",
    accompanyingCanvas: "Mukana oleva kangas",
    language: "Kieli",
    id: "Tunniste",
    type: "Tyyppi",
    format: "Muoto",
    profile: "Profiili",
    height: "Korkeus",
    width: "Leveys",
    duration: "Kesto",
    viewingDirection: "Katselusuunta",
    behavior: "Käyttäytyminen",
    timeMode: "Aikatila",
    motivation: "Motivaatio",
    homepage: "Kotisivu",
    logo: "Logo",
    rendering: "Vaihtoehtoinen esitys",
    service: "Palvelu",
    services: "Palvelut",
    seeAlso: "Aiheeseen liittyvä kuvaus",
    partOf: "Osa",
    start: "Kanvas alkaa",
    supplementary: "Täydentävä sisältö",
    items: "Tuotteet",
    structures: "Rakenteet",
    annotations: "Huomautukset",
    target: "Kohde",
    body: "Runko",
    navPlace: "Navigointipaikka",
    textGranularity: "Tekstin tarkkuus",
    value: "Arvo",
  },
  documentation: {
    definedTypes: {
      Collection:
        "Tilattu luettelo manifesteista ja/tai muista kokoelmista. Kokoelmien avulla manifestit ja alikokoelmat voidaan ryhmitellä hierarkkiseen rakenteeseen esitystä varten, mikä voi olla navigoinnin luomista, dynaamisten hakutulosten näyttämistä tai kiinteiden resurssien tarjoamista mihin tahansa muuhun tarkoitukseen.",
      Manifest:
        "Kuvaus yhdistetyn kohteen rakenteesta ja ominaisuuksista. Se sisältää tietoja, joita asiakas tarvitsee esittääkseen sisällön käyttäjälle, kuten otsikon ja muuta kuvaavaa tietoa esineestä tai sen välittämästä henkisestä teoksesta. Kussakin manifestissa kuvataan yleensä, kuinka yksittäinen yhdistelmäobjekti, kuten kirja, patsas tai musiikkialbumi, esitetään.",
      Canvas:
        'Virtuaalinen säilö, joka edustaa tiettyä näkymää objektista ja johon on liitetty sisältöresursseja tai sen osia. Canvas tarjoaa viitekehyksen sisällön asettelulle sekä tilallisesti että ajallisesti. Canvas-konsepti on lainattu standardeista, kuten PDF ja HTML, tai sovelluksista, kuten Photoshop ja PowerPoint, joissa alun perin tyhjälle näyttöpinnalle on "maalattu" kuvia, videoita, tekstiä ja muuta sisältöä Annotation-sivuille kerätyillä huomautuksilla.',
      Range:
        "Tilattu luettelo kankaista ja/tai muista sarjoista. Alueet mahdollistavat kankaiden tai niiden osien ryhmittelyn jollakin tavalla. Tämä voi johtua sisältöön perustuvista syistä, kuten voidaan kuvata sisällysluettelossa tai näytelmän kohtaussarjassa. Samoin fyysiset ominaisuudet voivat olla tärkeitä, kuten sivujen kerääminen varhaisessa kirjassa tai kun tallennettu musiikki on jaettu eri fyysisille kantoaaltoille, kuten kahdelle CD-levylle.",
      AnnotationPage:
        "Järjestetty luettelo huomautuksista, jotka tyypillisesti liitetään kankaaseen, mutta joihin voidaan viitata myös muun tyyppisistä resursseista. Merkintäsivut keräävät ja järjestävät merkintöjen luetteloita, jotka puolestaan ​​tarjoavat kommentteja resurssista tai sisällöstä, joka on osa kankaasta.",
      Annotation:
        "Merkinnät yhdistävät sisältöresurssit kankaisiin. Näkyviin ja/tai kuultaviin resursseihin käytetään samaa mekanismia kuin transkriptioihin, kommentteihin, tunnisteisiin ja muuhun sisältöön. Tämä tarjoaa yhden yhtenäisen menetelmän tietojen kohdistamiseen ja tarjoaa standardeihin perustuvan kehyksen resurssien osien ja kankaiden osien erottamiseen. Koska huomautuksia voidaan lisätä myöhemmin, se edistää hajautettua järjestelmää, jossa julkaisijat voivat kohdistaa sisältönsä muiden luomiin kuvauksiin. Annotaatioihin liittyvät toiminnot voivat myös perustua muihin luokkiin, kuten SpecificResource, Choice tai Selectors.",
      ContentResource:
        "Verkkoresurssit, kuten kuvat, ääni, video tai teksti, jotka liitetään kankaaseen huomautuksen kautta tai tarjoavat esityksen mistä tahansa resurssista.",
      AnnotationCollection:
        "Järjestetty luettelo huomautussivuista. Huomautuskokoelmat mahdollistavat korkeamman tason huomautusten ryhmittelyn tallentamisen. Esimerkiksi kaikki englanninkieliset käännökset Keskiaikaisen ranskalaisen asiakirjan huomautukset voitaisiin pitää erillään transkriptiosta tai nykyranskankielisestä painoksesta, tai ohjaajan kommentit elokuvasta voidaan erottaa käsikirjoituksesta.",
    },
    descriptive: {
      label:
        "Ihmisen luettavissa oleva etiketti, nimi tai otsikko. Tunniste-ominaisuus on tarkoitettu näytettäväksi resurssin lyhyenä tekstimuotoisena korvikkeena, jos ihmisen on tehtävä ero sen ja vastaavien resurssien välillä, esimerkiksi objektien, sivujen tai näytettävien kuvien valinnan vaihtoehtojen välillä. Tunnisteominaisuus voidaan kansainvälistää täysin, ja jokaisella kielellä voi olla useita arvoja.",
      metadata:
        "Järjestetty luettelo kuvauksista, jotka näytetään käyttäjälle, kun he ovat vuorovaikutuksessa resurssin kanssa, annettu pareina ihmisen luettavissa olevina tunniste- ja arvomerkintöinä. Näiden merkintöjen sisältö on tarkoitettu vain esittelyyn; kuvailevaa semantiikkaa ei pidä päätellä. Syötettä voidaan käyttää välittämään tietoa kohteen luomisesta, fyysistä kuvausta, omistustietoja tai muita tarkoituksia.",
      summary:
        "Lyhyt tekstiyhteenveto, joka on tarkoitettu välitettäväksi käyttäjälle, kun resurssin metatietomerkintöjä ei näytetä. Tätä voidaan käyttää lyhyenä kuvauksena kohdetason hakutuloksille, pieninäyttöisille ympäristöille tai vaihtoehtoisena käyttöliittymänä, kun metatieto-ominaisuutta ei parhaillaan hahmonneta. Yhteenvetoominaisuus noudattaa samaa kaavaa kuin yllä kuvattu etikettiominaisuus.",
      requiredStatement:
        "Teksti, joka on näytettävä, kun resurssia näytetään tai käytetään. Esimerkiksi requiredStatement-ominaisuutta voidaan käyttää esittämään tekijänoikeus- tai omistusselvityksiä, tunnustusta omistavasta ja/tai julkaisevasta laitoksesta tai muusta tekstistä, jonka julkaisija pitää tärkeänä näyttää käyttäjälle. Potentiaalisten asiakaskäyttöliittymien laajan vaihtelun vuoksi tätä lausuntoa ei aina ole mahdollista näyttää käyttäjälle asiakkaan alkuperäisessä tilassa. Jos se on alun perin piilotettu, asiakkaan tulee tehdä tapa paljastaa se mahdollisimman ilmeiseksi.",
      rights:
        "Merkkijono, joka identifioi resurssin sisältöä, kuten manifestin JSON tai kuvan pikseleitä koskevan lisenssi- tai oikeuslausekkeen. Arvo on otettava Creative Commons-lisenssin URI-joukosta, RightsStatements.org-oikeuslausekkeen URI-tunnistejoukosta tai laajennusmekanismin kautta lisätyistä. Tämän ominaisuuden sisällyttäminen on informatiivinen, ja sitä voidaan käyttää esimerkiksi näyttämään kuvake, joka edustaa oikeuksia koskevia väitteitä.",
      provider:
        "Organisaatio tai henkilö, joka on osallistunut resurssin sisällön tuottamiseen. Asiakkaat voivat sitten näyttää nämä tiedot käyttäjälle vahvistaakseen palveluntarjoajan panoksen. Tämä eroaa requiredStatement-ominaisuudesta siinä, että tiedot on jäsennelty, jolloin asiakas voi tehdä muutakin kuin vain esittää tekstiä, mutta sen sijaan hänellä on monipuolisempaa tietoa ihmisistä ja organisaatioista käytettäväksi eri käyttöliittymissä.",
      thumbnail:
        "Sisältöresurssi, kuten pieni kuva tai lyhyt äänileike, joka edustaa resurssia, jolla on pikkukuvaominaisuus. Resurssissa voi olla useita pikkukuvaresursseja, joilla on sama tai eri tyyppi ja muoto.",
      navDate:
        "Päivämäärä, jota asiakkaat voivat käyttää navigointitarkoituksiin esittäessään resurssia käyttäjälle päivämääräpohjaisessa käyttöliittymässä, kuten kalenterissa tai aikajanalla. Ihmisravinnoksi tarkoitettuun metatieto-ominaisuuteen tulisi sisällyttää kuvaavammat ajanjaksot, jotka on tarkoitettu näytettäväksi suoraan käyttäjälle. Jos resurssi sisältää kankaita, joilla on kesto-ominaisuus, annettu päivämäärä-aika vastaa resurssin aloituksen navigointipäivämäärää. Esimerkiksi alue, joka sisältää kankaan, joka edustaa videosisältöä, joka tallentaa historiallisen tapahtuman, navDate on tallennetun tapahtuman ensimmäisen hetken päivämäärä-aika.",
      placeholderCanvas:
        "Yksittäinen kangas, joka tarjoaa lisäsisältöä käytettäväksi ennen placeholderCanvas-ominaisuuden sisältävän resurssin pääsisällön hahmontamista tai kyseisen sisällön mainoksena tai varaosana. Esimerkkejä ovat kuvat, teksti ja ääni, jotka seisovat videosisällössä ennen kuin käyttäjä aloittaa toiston; tai elokuvajuliste herättääkseen käyttäjien huomion. placeholderCanvas:n tarjoama sisältö eroaa pikkukuvasta: asiakas voi käyttää pikkukuvaa yhteenvedon tekemiseen ja useiden resurssien selaamiseen ja näyttää sitten placeholderCanvas:n sisällön osana yksittäisen resurssin esittelyä. Paikkamerkkikankaalla on todennäköisesti erilaiset mitat kuin placeholderCanvas-ominaisuuden omaavan resurssin kankaalla.",
      accompanyingCanvas:
        "Yksittäinen kangas, joka tarjoaa lisäsisältöä käytettäväksi hahmonnettaessa resurssia, jolla on accompanyingCanvas-ominaisuus. Esimerkkejä ovat kuva, joka näytetään, kun vain kestoa sisältävä Canvas toistaa ääntä; tai taustaääntä toistettavana, kun käyttäjä navigoi vain kuvaluettelossa.",
      language:
        "Tämän ulkoisen resurssin sisällössä käytetty kieli tai kielet. Tämä ominaisuus on jo saatavilla Web Annotation -mallissa sisältöresursseille, jotka ovat huomautuksen runko-osa tai kohde, mutta sitä voidaan käyttää myös resursseihin, joihin viitataan kotisivulta, hahmontamisesta ja partOf:sta.",
    },
    technical: {
      id: "URI, joka tunnistaa resurssin. Jos resurssi on käytettävissä vain upotettuna toiseen resurssiin, kuten luettelon alueeseen, URI voi olla upotettavan resurssin URI, jonka päässä on ainutlaatuinen fragmentti. Tämä ei päde Canvasesille, joilla on oltava oma URI ilman fragmenttia.",
      type: "Resurssin tyyppi tai luokka. Tätä määritystä varten määritellyille luokille",
      format:
        "Tietty mediatyyppi (kutsutaan usein MIME-tyypiksi) sisältöresurssille, esimerkiksi kuva/jpeg. Tämä on tärkeää, jotta voit erottaa saman yleisen resurssityypin eri muodot, kuten XML:n tekstin erottamisen tavallisesta tekstistä.",
      profile:
        "Resurssista saatavilla oleva skeema tai nimetty toimintosarja. Profiili voi edelleen selventää ulkoisen resurssin tai palvelun tyyppiä ja/tai muotoa, jolloin asiakkaat voivat mukauttaa profiiliominaisuuden omaavan resurssin käsittelyä.",
      height:
        "Kankaan tai ulkoisen sisältöresurssin korkeus. Sisältöresurssien arvo on pikseleinä. Canvasesissa arvolla ei ole yksikköä. Yhdessä leveyden kanssa se välittää sen tilan kuvasuhteen, jossa sisältöresurssit sijaitsevat.",
      width:
        "Kanvas- tai ulkoisen sisältöresurssin leveys. Sisältöresurssien arvo on pikseleinä. Canvasesissa arvolla ei ole yksikköä. Yhdessä korkeuden kanssa se välittää kuvasuhteen tilaan, jossa sisältöresurssit sijaitsevat.",
      duration: "Kankaan tai ulkoisen sisältöresurssin kesto sekunneissa.",
      viewingDirection:
        "Suunta, jossa kankaita pitäisi näyttää käyttäjälle. Tämä eritelmä määrittelee neljä suunta-arvoa alla olevassa taulukossa. Muut voidaan määritellä ulkoisesti laajennuksiksi.",
      behavior:
        "Joukko käyttökokemuksen ominaisuuksia, joita sisällön julkaisija haluaisi asiakkaan käyttävän esitellessään resurssia. Tämä spesifikaatio määrittelee arvot alla olevassa taulukossa. Muut voidaan määritellä ulkoisesti laajennuksiksi.",
      timeMode:
        "Annotaatioon liittyvä tila, jota käytetään minkä tahansa aikaperusteisen median hahmontamiseen tai jolla voidaan muuten katsoa olevan kesto, jota käytetään kyseisen huomautuksen runkoresurssina. Huomaa, että timeMode:n yhdistäminen huomautukseen tarkoittaa, että kehon eri resurssilla ei voi olla erilaisia ​​arvoja. Tämä spesifikaatio määrittelee alla olevassa taulukossa määritellyt arvot. Muut voidaan määritellä ulkoisesti laajennuksiksi.",
      motivation:
        'Tämä määrittely määrittää kaksi arvoa Web Annotation -ominaisuuden motivaatiolle tai tarkoitukselle, kun sitä käytetään tietyssä resurssissa tai Textual Body:ssa. Resurssit, jotka liittyvät kankaaseen merkinnällä, jonka motivaatioarvo on "painting", on esitettävä käyttäjälle kankaan esityksenä. Resurssit, jotka liittyvät kankaaseen huomautuksella, jolla on motivaatioarvo supplementing, voidaan esittää käyttäjälle osana Canvas-esitystä tai ne voidaan esittää käyttöliittymän eri osassa.',
    },
    linking: {
      homepage:
        "Web-sivu, joka koskee etusivun ominaisuuden omaavan resurssin edustamaa objektia. Web-sivun julkaisee yleensä objektista vastaava organisaatio, ja sen voi luoda sisällönhallintajärjestelmä tai muu luettelointijärjestelmä. Resurssi on voitava näyttää suoraan käyttäjälle. Resurssit, jotka liittyvät toisiinsa, mutta eivät kotisivut, on sen sijaan lisättävä metatieto-ominaisuuteen, ja niihin on lisättävä sopiva tunniste tai arvo kuvaamaan suhdetta.",
      logo: "Pieni kuvaresurssi, joka edustaa agenttiresurssia, johon se on liitetty. Logon tulee olla selkeästi renderöity resurssia esitettäessä tai käytettäessä kuvaa rajaamatta, kiertämättä tai muuten vääristämättä. On suositeltavaa, että tälle kuvalle on saatavilla IIIF Image API -palvelu muita käsittelyjä, kuten koon muuttamista varten.",
      rendering:
        "Resurssi, joka on vaihtoehtoinen, ei-IIIF-esitys resurssista, jolla on renderöintiominaisuus. Tällaisia ​​esityksiä ei yleensä voi maalata yhdelle kankaalle, koska ne sisältävät joko liian monta näkymää, niiden mitat ovat yhteensopimattomia tai ne ovat yhdistelmäresursseja, jotka vaativat lisärenderöintitoimintoja. Renderöintiresurssin on voitava näyttää suoraan ihmiskäyttäjälle, vaikka esitys voi olla IIIF-asiakkaan ulkopuolella. Resurssissa ei saa olla aloitussivua tai muuta väliresurssia, joka välittää pääsyn siihen. Jos kulunvalvonta vaaditaan, IIIF Authentication API:ta suositellaan. Esimerkkejä ovat kirjan renderöiminen muodossa PDF tai EPUB, liukukansi, jossa on kuvia rakennuksesta, tai 3D-malli patsaasta.",
      service:
        "Palvelu, jonka kanssa asiakas voi olla vuorovaikutuksessa suoraan ja saada lisätietoja tai toimintoja palveluominaisuuden omaavan resurssin käyttämiseksi, kuten kuvasta liitetyn IIIF Image API -palvelun perus-URI-tiedostoon. Palveluresurssiin tulisi liittää lisätietoja, jotta asiakas voi päättää, kuinka käyttää sitä asianmukaisesti. Katso palvelurekisteriasiakirjasta tiedot tällä hetkellä tunnetuista palvelutyypeistä.",
      services:
        "Luettelo yhdestä tai useammasta palvelumäärittelystä asiakirjan ylimmässä resurssissa, jotka yleensä jaetaan useamman kuin yhden myöhemmän resurssin kanssa. Tämä mahdollistaa näiden jaettujen palvelujen keräämisen yhteen paikkaan sen sijaan, että niiden tiedot toistettaisiin mahdollisesti monta kertaa läpi asiakirjan tai joutuisi kuluttamaan asiakasta käymään läpi koko asiakirjarakenteen tiedon löytämiseksi. Resurssilla, jota palvelu koskee, on edelleen oltava yllä kuvattu service-ominaisuus, jossa palveluresursseilla on vähintään id and type tai @id ja @type ominaisuudet. Näin asiakas tietää, että palvelu koskee kyseistä resurssia. Palveluomaisuuden käyttö on julkaisujärjestelmän harkinnassa.",
      seeAlso:
        "Koneluettava resurssi, kuten XML- tai RDF-kuvaus, joka liittyy nykyiseen resurssiin, jolla on ominaisuus seeAlso. Resurssin ominaisuudet tulee antaa, jotta asiakas voi valita useiden kuvausten välillä (jos tarjotaan) ja käyttää asiakirjaa asianmukaisesti. Jos resurssin ja asiakirjan välisen suhteen on oltava tarkempi, asiakirjan tulee sisältää kyseinen suhde IIIF-resurssin sijaan. Muut IIIF-resurssit ovat myös kelvollisia kohteita seeAlso:lle, esimerkiksi linkittääksesi manifestiin, joka kuvaa liittyvän objektin. Asiakirjan URI on tunnistettava tiedoista yksi esitys tietyssä muodossa. Jos esimerkiksi JSON:ssa ja XML:ssa on samat tiedot, kullekin esitykselle tulee lisätä erilliset resurssit, joilla on erilliset tunnus- ja muotoominaisuudet.",
      partOf:
        "Sisältää resurssin, joka sisältää resurssin, jolla on ominaisuus partOf. Kun asiakas kohtaa partOf-ominaisuuden, se saattaa noutaa viitatun sisältävän resurssin, jos sitä ei ole upotettu nykyiseen esitykseen, edistääkseen sisällytetyn resurssin käsittelyä. Esimerkiksi kankaalla olevaa partOf-ominaisuutta voidaan käyttää viittaamaan ulkoiseen manifestiin lisätietojen löytämisen mahdollistamiseksi. Samalla tavalla manifesti voi viitata sisältävään kokoelmaan käyttämällä partOf:ta navigoinnin avuksi.",
      start:
        "Canvas tai osa Canvasista, joka asiakkaan tulee näyttää aloitusominaisuuden omaavan resurssin alustuksen yhteydessä. Viittausta kankaan osaan käsitellään samalla tavalla kuin Ranges-viittauksia kankaiden osiin. Tämän ominaisuuden avulla asiakas voi aloittaa ensimmäisestä mielenkiintoista sisältöä sisältävästä kankaasta sen sijaan, että käyttäjä joutuisi navigoimaan manuaalisesti löytääkseen sen.",
      supplementary:
        "Linkki tältä alueelta huomautuskokoelmaan, joka sisältää alueen sisältöresurssien supplementing-merkinnät. Asiakkaat voivat käyttää tätä lisäsisällön esittämiseen käyttäjälle eri kankaalta ollessaan vuorovaikutuksessa alueen kanssa tai siirtyäkseen alueen seuraavaan osaan samalla kankaalla. Alue voi esimerkiksi edustaa sanomalehtiartikkelia, joka kattaa ei-peräkkäiset sivut, ja käyttää sitten lisäominaisuutta viittaamaan huomautuskokoelmaan, joka koostuu tekstin tallentavista huomautuksista, jaettuna huomautussivuihin sanomalehden sivua kohti. Vaihtoehtoisesti alue voi edustaa niitä käsikirjoituksen osia, jotka on litteroitu tai käännetty, kun muita osia on vielä työstettävä. Annotation Collection olisi merkinnät, jotka transkriptoivat tai kääntävät vastaavasti.",
    },
    structural: {
      items:
        "Suuri osa IIIF Presentation API:n toiminnoista tallentaa yksinkertaisesti järjestyksen, jossa aliresurssit esiintyvät ylätason resurssissa, kuten kokoelmat tai manifestit yläkokoelmassa tai kankaat luettelossa. Kaikki nämä tilanteet on peitetty yhdellä omaisuudella, tavaralla.",
      structures:
        'Manifestina esitetyn objektin rakennetta voidaan kuvata käyttämällä aluehierarkiaa. Alueita voidaan käyttää kuvaamaan kohteen "sisällysluetteloa" tai muita rakenteita, joiden kanssa käyttäjä voi olla vuorovaikutuksessa Manifestin items-ominaisuuden antaman järjestyksen ulkopuolella. Hierarkia rakennetaan sijoittamalla alatason resurssit ylemmän tason Range-kohdetaulukkoon. Näiden hierarkioiden ylätason alueet on annettu rakenne-ominaisuudessa.',
      annotations:
        "Järjestetty luettelo huomautussivuista, jotka sisältävät kommentteja tai muita huomautuksia tästä resurssista, erillään merkinnöistä, joita käytetään sisällön maalaamiseen kankaalle. Annotaatioiden motivaatio ei saa olla painting, ja huomautusten kohteen on sisällettävä tämä resurssi tai osa siitä.",
    },
    attribution:
      "Copyright © 2012-2023 Toimittajat ja avustajat. Julkaisija IIIF Consortium CC-BY-lisenssillä, katso vastuuvapauslauseke.",
  },
  behavior: {
    groups: {
      autoAdvance: "Automaattinen eteneminen",
      repeat: "Toistaa",
      manifestOrdering: "Ilmeinen tilaus",
      canvasOrdering: "Kankaan tilaaminen",
      collection: "Kokoelma",
      range: "Alue",
      collectionOrdering: "Keräyksen tilaus",
      rangeOrdering: "Alueen tilaus",
      hidden: "Näkyvyys",
    },
    values: {
      "auto-advance": "Automaattinen eteneminen",
      "no-auto-advance": "Ei automaattista etenemistä",
      repeat: "Toistaa",
      "no-repeat": "Ei toistoa",
      unordered: "Tilaamaton",
      individuals: "Yksittäisiä kankaita",
      continuous: "Jatkuva",
      paged: "Sivuttu",
      "facing-pages": "Vastakkaiset sivut",
      "non-paged": "Sivuttamaton",
      "multi-part": "Moniosainen",
      together: "Yhdessä",
      sequence: "Järjestys",
      "thumbnail-nav": "Pikkukuvanavigointi",
      "no-nav": "Ei navigointia",
      hidden: "Piilotettu",
    },
  },
  rights: {
    attributionNonCommercialNoDerivs: {
      label: "Nimeä-Ei-kaupallinen-NoDerivs",
      description:
        "Tämä lisenssi on rajoittavin kuudesta päälisenssistämme, ja se sallii muiden vain ladata teoksiasi ja jakaa niitä muiden kanssa niin kauan kuin he antavat sinulle tunnustuksen, mutta he eivät voi muuttaa niitä millään tavalla tai käyttää niitä kaupallisesti.",
    },
    attributionNonCommercialShareAlike: {
      label: "Nimeä-Ei-kaupallinen-ShareAlike",
      description:
        "Tämän lisenssin avulla muut voivat miksata, muokata ja rakentaa töitäsi ei-kaupallisesti, kunhan he antavat sinulle tunnustuksen ja lisensoivat uusia luomuksiaan samoilla ehdoilla.",
    },
    attributionNonCommercial: {
      label: "Nimeä-ei-kaupallinen",
      description:
        "Tämän lisenssin avulla muut voivat remiksoida, muokata ja rakentaa töitäsi ei-kaupallisesti, ja vaikka heidän uusien teostensa on myös tunnustettava sinut ja olla ei-kaupallisia, heidän ei tarvitse lisensoida johdannaisteoksiaan samoin ehdoin.",
    },
    attributionNoDerivs: {
      label: "Attribution-NoDerivs",
      description:
        "Tämä lisenssi antaa muiden käyttää teosta uudelleen mihin tahansa tarkoitukseen, mukaan lukien kaupallinen; sitä ei kuitenkaan voi jakaa muiden kanssa mukautetussa muodossa, ja sinulle on annettava luotto.",
    },
    attributionShareAlike: {
      label: "Attribution-ShareAlike",
      description:
        'Tämä lisenssi antaa muiden remiksoida, mukauttaa ja rakentaa töitäsi jopa kaupallisiin tarkoituksiin, kunhan he antavat sinulle tunnustuksen ja lisensoivat uusia luomuksiaan samoilla ehdoilla. Tätä lisenssiä verrataan usein "copyleft" ilmaisiin ja avoimen lähdekoodin ohjelmistolisensseihin. Kaikilla sinun teoksiisi perustuvilla uusilla teoksilla on sama lisenssi, joten kaikki johdannaiset sallivat myös kaupallisen käytön. Tämä on Wikipedian käyttämä lisenssi, ja sitä suositellaan materiaalille, joka hyötyisi Wikipedian sisällön ja vastaavien lisensoitujen projektien sisällyttämisestä.',
    },
    attribution: {
      label: "Attribuutio",
      description:
        "Tämä lisenssi antaa muiden levittää, miksata, muokata ja rakentaa töitäsi, jopa kaupallisesti, kunhan he antavat sinulle tunnustuksen alkuperäisestä luomuksesta. Tämä on tarjotuista lisensseistä edullisin. Suositellaan lisensoidun materiaalin maksimaaliseen levittämiseen ja käyttöön.",
    },
    publicDomain: {
      label: "Julkinen verkkotunnus",
      description:
        "Teoksen tähän tekoon yhdistänyt henkilö on omistanut teoksen julkisesti luopumalla kaikista oikeuksistaan ​​teokseen maailmanlaajuisesti tekijänoikeuslain nojalla, mukaan lukien kaikki lähi- ja lähioikeudet, lain sallimissa rajoissa.",
    },
  },
  sizes: {
    landscape: "12 × 8 · Maisema",
    wide: "12 × 6 · Leveä",
    square: "12 × 12 · Neliö",
    portrait: "8 × 12 · Muotokuva",
  },
} as const;

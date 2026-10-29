/**
 * Dutch (nl) — exhibition namespace
 *
 * "Dia" (plural "dia's" with apostrophe before -s) is the natural Dutch word
 * for a slide/projection. The apostrophe prevents reading "dias" as two syllables
 * with a long-a vowel — standard Dutch orthography for words ending in a vowel.
 *
 * "Tentoonstellingseditor" is a Dutch compound noun (tentoonstelling + editor);
 * no hyphen is required between the two parts because "tentoonstelling" ends in
 * a consonant. The slideshow variant appends "(diavoorstelling)".
 *
 * "Rondleidingsstap" (tour step): rondleiding + stap, double-s insertion is correct
 * Dutch compound-noun orthography (liaisonklank).
 */
export const catalog = {
  app: {
    title: "Tentoonstellingseditor",
    slideshow: "Tentoonstellingseditor (diavoorstelling)",
  },
  panels: {
    slides: "Dia's",
    theme: "Thema",
    overview: "Overzicht",
    tourSteps: "Rondleidingsstappen",
  },
  slide: {
    add: "Dia toevoegen",
    empty: "Geen dia's",
    count_one: "{{count}} dia",
    count_other: "{{count}} dia's",
    removeConfirm: "Deze dia uit de tentoonstelling verwijderen?",
  },
  theme: {
    title: "Thema",
    background: "Achtergrond",
    textColour: "Tekstkleur",
    font: "Lettertype",
  },
  tourStep: {
    add: "Rondleidingsstap toevoegen",
    empty: "Geen rondleidingsstappen",
    count_one: "{{count}} rondleidingsstap",
    count_other: "{{count}} rondleidingsstappen",
  },
  template: {
    choose: "Kies een tentoonstellingssjabloon",
    preview: "Sjabloon bekijken",
  },
} as const;

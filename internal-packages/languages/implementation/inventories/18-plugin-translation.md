# Content translation plugin interface source inventory

Module: `plugins/translation`. Revision: `66de064a5d217b7847db924db925b092b36a0eed`. [Implementation task](../modules/18-plugin-translation.md).

Default application-source scan: **216 occurrences** in **9 files** (22 files scanned). Expanded JS/TS scan including tests/stories/tutorials/examples: **236 occurrences**.

These are syntactic candidates, not final message IDs or verified active UI. Scans use git's tracked/unignored files and exclude generated, public and vendor assets. Supporting-source strings are usually fixtures or assertions, not catalog entries. Markdown/MDX/JSON/CSS and third-party UI are not included. Review authored defaults and developer errors before extraction. Mixed JSX may be fragments of one whole message. Text below is shortened to 180 characters; follow the source link for the original.

## Default application source files

| File | Candidate occurrences |
| --- | ---: |
| [plugins/translation/src/languages.ts](../../../../plugins/translation/src/languages.ts) | 100 |
| [plugins/translation/src/sidebar.tsx](../../../../plugins/translation/src/sidebar.tsx) | 50 |
| [plugins/translation/src/config-modal.tsx](../../../../plugins/translation/src/config-modal.tsx) | 25 |
| [plugins/translation/src/plugin.ts](../../../../plugins/translation/src/plugin.ts) | 15 |
| [plugins/translation/src/results.tsx](../../../../plugins/translation/src/results.tsx) | 11 |
| [plugins/translation/src/background-action.tsx](../../../../plugins/translation/src/background-action.tsx) | 5 |
| [plugins/translation/src/language-tags-background-action.ts](../../../../plugins/translation/src/language-tags-background-action.ts) | 5 |
| [plugins/translation/src/runtime/browser/client.ts](../../../../plugins/translation/src/runtime/browser/client.ts) | 4 |
| [plugins/translation/src/runtime/worker/entry.ts](../../../../plugins/translation/src/runtime/worker/entry.ts) | 1 |

## Expanded review list

### plugins/translation/src/languages.ts

- [ ] Review [source](../../../../plugins/translation/src/languages.ts) and classify its 100 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [13](../../../../plugins/translation/src/languages.ts#L13) | object-field | Afrikaans | module-definition |
| [14](../../../../plugins/translation/src/languages.ts#L14) | object-field | Amharic | module-definition |
| [15](../../../../plugins/translation/src/languages.ts#L15) | object-field | Arabic | module-definition |
| [16](../../../../plugins/translation/src/languages.ts#L16) | object-field | Asturian | module-definition |
| [17](../../../../plugins/translation/src/languages.ts#L17) | object-field | Azerbaijani | module-definition |
| [18](../../../../plugins/translation/src/languages.ts#L18) | object-field | Bashkir | module-definition |
| [19](../../../../plugins/translation/src/languages.ts#L19) | object-field | Belarusian | module-definition |
| [20](../../../../plugins/translation/src/languages.ts#L20) | object-field | Bulgarian | module-definition |
| [21](../../../../plugins/translation/src/languages.ts#L21) | object-field | Bengali | module-definition |
| [22](../../../../plugins/translation/src/languages.ts#L22) | object-field | Breton | module-definition |
| [23](../../../../plugins/translation/src/languages.ts#L23) | object-field | Bosnian | module-definition |
| [24](../../../../plugins/translation/src/languages.ts#L24) | object-field | Catalan; Valencian | module-definition |
| [25](../../../../plugins/translation/src/languages.ts#L25) | object-field | Cebuano | module-definition |
| [26](../../../../plugins/translation/src/languages.ts#L26) | object-field | Czech | module-definition |
| [27](../../../../plugins/translation/src/languages.ts#L27) | object-field | Welsh | module-definition |
| [28](../../../../plugins/translation/src/languages.ts#L28) | object-field | Danish | module-definition |
| [29](../../../../plugins/translation/src/languages.ts#L29) | object-field | German | module-definition |
| [30](../../../../plugins/translation/src/languages.ts#L30) | object-field | Greek | module-definition |
| [31](../../../../plugins/translation/src/languages.ts#L31) | object-field | English | module-definition |
| [32](../../../../plugins/translation/src/languages.ts#L32) | object-field | Spanish | module-definition |
| [33](../../../../plugins/translation/src/languages.ts#L33) | object-field | Estonian | module-definition |
| [34](../../../../plugins/translation/src/languages.ts#L34) | object-field | Persian | module-definition |
| [35](../../../../plugins/translation/src/languages.ts#L35) | object-field | Fulah | module-definition |
| [36](../../../../plugins/translation/src/languages.ts#L36) | object-field | Finnish | module-definition |
| [37](../../../../plugins/translation/src/languages.ts#L37) | object-field | French | module-definition |
| [38](../../../../plugins/translation/src/languages.ts#L38) | object-field | Western Frisian | module-definition |
| [39](../../../../plugins/translation/src/languages.ts#L39) | object-field | Irish | module-definition |
| [40](../../../../plugins/translation/src/languages.ts#L40) | object-field | Gaelic; Scottish Gaelic | module-definition |
| [41](../../../../plugins/translation/src/languages.ts#L41) | object-field | Galician | module-definition |
| [42](../../../../plugins/translation/src/languages.ts#L42) | object-field | Gujarati | module-definition |
| [43](../../../../plugins/translation/src/languages.ts#L43) | object-field | Hausa | module-definition |
| [44](../../../../plugins/translation/src/languages.ts#L44) | object-field | Hebrew | module-definition |
| [45](../../../../plugins/translation/src/languages.ts#L45) | object-field | Hindi | module-definition |
| [46](../../../../plugins/translation/src/languages.ts#L46) | object-field | Croatian | module-definition |
| [47](../../../../plugins/translation/src/languages.ts#L47) | object-field | Haitian; Haitian Creole | module-definition |
| [48](../../../../plugins/translation/src/languages.ts#L48) | object-field | Hungarian | module-definition |
| [49](../../../../plugins/translation/src/languages.ts#L49) | object-field | Armenian | module-definition |
| [50](../../../../plugins/translation/src/languages.ts#L50) | object-field | Indonesian | module-definition |
| [51](../../../../plugins/translation/src/languages.ts#L51) | object-field | Igbo | module-definition |
| [52](../../../../plugins/translation/src/languages.ts#L52) | object-field | Iloko | module-definition |
| [53](../../../../plugins/translation/src/languages.ts#L53) | object-field | Icelandic | module-definition |
| [54](../../../../plugins/translation/src/languages.ts#L54) | object-field | Italian | module-definition |
| [55](../../../../plugins/translation/src/languages.ts#L55) | object-field | Japanese | module-definition |
| [56](../../../../plugins/translation/src/languages.ts#L56) | object-field | Javanese | module-definition |
| [57](../../../../plugins/translation/src/languages.ts#L57) | object-field | Georgian | module-definition |
| [58](../../../../plugins/translation/src/languages.ts#L58) | object-field | Kazakh | module-definition |
| [59](../../../../plugins/translation/src/languages.ts#L59) | object-field | Central Khmer | module-definition |
| [60](../../../../plugins/translation/src/languages.ts#L60) | object-field | Kannada | module-definition |
| [61](../../../../plugins/translation/src/languages.ts#L61) | object-field | Korean | module-definition |
| [62](../../../../plugins/translation/src/languages.ts#L62) | object-field | Luxembourgish; Letzeburgesch | module-definition |
| [63](../../../../plugins/translation/src/languages.ts#L63) | object-field | Ganda | module-definition |
| [64](../../../../plugins/translation/src/languages.ts#L64) | object-field | Lingala | module-definition |
| [65](../../../../plugins/translation/src/languages.ts#L65) | object-field | Lao | module-definition |
| [66](../../../../plugins/translation/src/languages.ts#L66) | object-field | Lithuanian | module-definition |
| [67](../../../../plugins/translation/src/languages.ts#L67) | object-field | Latvian | module-definition |
| [68](../../../../plugins/translation/src/languages.ts#L68) | object-field | Malagasy | module-definition |
| [69](../../../../plugins/translation/src/languages.ts#L69) | object-field | Macedonian | module-definition |
| [70](../../../../plugins/translation/src/languages.ts#L70) | object-field | Malayalam | module-definition |
| [71](../../../../plugins/translation/src/languages.ts#L71) | object-field | Mongolian | module-definition |
| [72](../../../../plugins/translation/src/languages.ts#L72) | object-field | Marathi | module-definition |
| [73](../../../../plugins/translation/src/languages.ts#L73) | object-field | Malay | module-definition |
| [74](../../../../plugins/translation/src/languages.ts#L74) | object-field | Burmese | module-definition |
| [75](../../../../plugins/translation/src/languages.ts#L75) | object-field | Nepali | module-definition |
| [76](../../../../plugins/translation/src/languages.ts#L76) | object-field | Dutch; Flemish | module-definition |
| [77](../../../../plugins/translation/src/languages.ts#L77) | object-field | Norwegian | module-definition |
| [78](../../../../plugins/translation/src/languages.ts#L78) | object-field | Northern Sotho | module-definition |
| [79](../../../../plugins/translation/src/languages.ts#L79) | object-field | Occitan | module-definition |
| [80](../../../../plugins/translation/src/languages.ts#L80) | object-field | Oriya | module-definition |
| [81](../../../../plugins/translation/src/languages.ts#L81) | object-field | Panjabi; Punjabi | module-definition |
| [82](../../../../plugins/translation/src/languages.ts#L82) | object-field | Polish | module-definition |
| [83](../../../../plugins/translation/src/languages.ts#L83) | object-field | Pushto; Pashto | module-definition |
| [84](../../../../plugins/translation/src/languages.ts#L84) | object-field | Portuguese | module-definition |
| [85](../../../../plugins/translation/src/languages.ts#L85) | object-field | Romanian; Moldavian; Moldovan | module-definition |
| [86](../../../../plugins/translation/src/languages.ts#L86) | object-field | Russian | module-definition |
| [87](../../../../plugins/translation/src/languages.ts#L87) | object-field | Sindhi | module-definition |
| [88](../../../../plugins/translation/src/languages.ts#L88) | object-field | Sinhala; Sinhalese | module-definition |
| [89](../../../../plugins/translation/src/languages.ts#L89) | object-field | Slovak | module-definition |
| [90](../../../../plugins/translation/src/languages.ts#L90) | object-field | Slovenian | module-definition |
| [91](../../../../plugins/translation/src/languages.ts#L91) | object-field | Somali | module-definition |
| [92](../../../../plugins/translation/src/languages.ts#L92) | object-field | Albanian | module-definition |
| [93](../../../../plugins/translation/src/languages.ts#L93) | object-field | Serbian | module-definition |
| [94](../../../../plugins/translation/src/languages.ts#L94) | object-field | Swati | module-definition |
| [95](../../../../plugins/translation/src/languages.ts#L95) | object-field | Sundanese | module-definition |
| [96](../../../../plugins/translation/src/languages.ts#L96) | object-field | Swedish | module-definition |
| [97](../../../../plugins/translation/src/languages.ts#L97) | object-field | Swahili | module-definition |
| [98](../../../../plugins/translation/src/languages.ts#L98) | object-field | Tamil | module-definition |
| [99](../../../../plugins/translation/src/languages.ts#L99) | object-field | Thai | module-definition |
| [100](../../../../plugins/translation/src/languages.ts#L100) | object-field | Tagalog | module-definition |
| [101](../../../../plugins/translation/src/languages.ts#L101) | object-field | Tswana | module-definition |
| [102](../../../../plugins/translation/src/languages.ts#L102) | object-field | Turkish | module-definition |
| [103](../../../../plugins/translation/src/languages.ts#L103) | object-field | Ukrainian | module-definition |
| [104](../../../../plugins/translation/src/languages.ts#L104) | object-field | Urdu | module-definition |
| [105](../../../../plugins/translation/src/languages.ts#L105) | object-field | Uzbek | module-definition |
| [106](../../../../plugins/translation/src/languages.ts#L106) | object-field | Vietnamese | module-definition |
| [107](../../../../plugins/translation/src/languages.ts#L107) | object-field | Wolof | module-definition |
| [108](../../../../plugins/translation/src/languages.ts#L108) | object-field | Xhosa | module-definition |
| [109](../../../../plugins/translation/src/languages.ts#L109) | object-field | Yiddish | module-definition |
| [110](../../../../plugins/translation/src/languages.ts#L110) | object-field | Yoruba | module-definition |
| [111](../../../../plugins/translation/src/languages.ts#L111) | object-field | Chinese | module-definition |
| [112](../../../../plugins/translation/src/languages.ts#L112) | object-field | Zulu | module-definition |

### plugins/translation/src/sidebar.tsx

- [ ] Review [source](../../../../plugins/translation/src/sidebar.tsx) and classify its 50 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [48](../../../../plugins/translation/src/sidebar.tsx#L48) | object-field | Translations | module-definition |
| [157](../../../../plugins/translation/src/sidebar.tsx#L157) | object-field | Detected in manifest | terminology |
| [221](../../../../plugins/translation/src/sidebar.tsx#L221) | object-field | All | — |
| [224](../../../../plugins/translation/src/sidebar.tsx#L224) | object-field | Current resource | — |
| [226](../../../../plugins/translation/src/sidebar.tsx#L226) | object-field | Current {{expression1}} | interpolation |
| [228](../../../../plugins/translation/src/sidebar.tsx#L228) | object-field | Missing | — |
| [229](../../../../plugins/translation/src/sidebar.tsx#L229) | object-field | Done | — |
| [230](../../../../plugins/translation/src/sidebar.tsx#L230) | object-field | Stale | — |
| [235](../../../../plugins/translation/src/sidebar.tsx#L235) | jsx-attribute | Translations | — |
| [241](../../../../plugins/translation/src/sidebar.tsx#L241) | jsx-attribute | From | — |
| [244](../../../../plugins/translation/src/sidebar.tsx#L244) | jsx-attribute | No detected languages | — |
| [249](../../../../plugins/translation/src/sidebar.tsx#L249) | jsx-attribute | To | — |
| [255](../../../../plugins/translation/src/sidebar.tsx#L255) | jsx-text | Mode | — |
| [265](../../../../plugins/translation/src/sidebar.tsx#L265) | jsx-text | Auto | — |
| [266](../../../../plugins/translation/src/sidebar.tsx#L266) | jsx-text | WebGPU | — |
| [267](../../../../plugins/translation/src/sidebar.tsx#L267) | jsx-text | WASM | — |
| [273](../../../../plugins/translation/src/sidebar.tsx#L273) | jsx-text | Unsupported languages: | mixed-jsx |
| [279](../../../../plugins/translation/src/sidebar.tsx#L279) | jsx-text | No supported IIIF languages were detected in this manifest. | terminology |
| [285](../../../../plugins/translation/src/sidebar.tsx#L285) | jsx-text | Choose different source and target languages. | — |
| [295](../../../../plugins/translation/src/sidebar.tsx#L295) | jsx-text | missing | mixed-jsx |
| [301](../../../../plugins/translation/src/sidebar.tsx#L301) | jsx-text | done | mixed-jsx |
| [307](../../../../plugins/translation/src/sidebar.tsx#L307) | jsx-text | stale | mixed-jsx |
| [310](../../../../plugins/translation/src/sidebar.tsx#L310) | jsx-text | No strings found | — |
| [318](../../../../plugins/translation/src/sidebar.tsx#L318) | jsx-attribute | Translate {{expression1}} missing string{{expression2}} | interpolation, mixed-jsx |
| [323](../../../../plugins/translation/src/sidebar.tsx#L323) | jsx-text | Running… | mixed-jsx |
| [328](../../../../plugins/translation/src/sidebar.tsx#L328) | jsx-text | Translate | mixed-jsx |
| [380](../../../../plugins/translation/src/sidebar.tsx#L380) | jsx-expression | No translatable strings found. | mixed-jsx |
| [382](../../../../plugins/translation/src/sidebar.tsx#L382) | jsx-expression | No current resource strings. | mixed-jsx |
| [383](../../../../plugins/translation/src/sidebar.tsx#L383) | jsx-expression | No {{expression1}} strings. | interpolation, mixed-jsx |
| [455](../../../../plugins/translation/src/sidebar.tsx#L455) | jsx-expression | String | mixed-jsx |
| [456](../../../../plugins/translation/src/sidebar.tsx#L456) | jsx-expression | · {{expression1}}× | interpolation, mixed-jsx |
| [468](../../../../plugins/translation/src/sidebar.tsx#L468) | jsx-text | Source | — |
| [474](../../../../plugins/translation/src/sidebar.tsx#L474) | jsx-attribute | {{expression1}} translation… | interpolation |
| [493](../../../../plugins/translation/src/sidebar.tsx#L493) | jsx-text | Filters | — |
| [503](../../../../plugins/translation/src/sidebar.tsx#L503) | jsx-text | Annotation bodies | mixed-jsx |
| [512](../../../../plugins/translation/src/sidebar.tsx#L512) | jsx-text | Canvas labels | mixed-jsx, terminology |
| [526](../../../../plugins/translation/src/sidebar.tsx#L526) | object-field | Detected in manifest | terminology |
| [529](../../../../plugins/translation/src/sidebar.tsx#L529) | object-field | {{expression1}} ({{expression2}}) | interpolation |
| [535](../../../../plugins/translation/src/sidebar.tsx#L535) | object-field | All languages | — |
| [549](../../../../plugins/translation/src/sidebar.tsx#L549) | object-field | No languages available | — |
| [592](../../../../plugins/translation/src/sidebar.tsx#L592) | object-field | text-amber-700 | module-definition |
| [592](../../../../plugins/translation/src/sidebar.tsx#L592) | object-field | Missing | module-definition |
| [593](../../../../plugins/translation/src/sidebar.tsx#L593) | object-field | text-green-700 | module-definition |
| [593](../../../../plugins/translation/src/sidebar.tsx#L593) | object-field | Done | module-definition |
| [594](../../../../plugins/translation/src/sidebar.tsx#L594) | object-field | text-red-600 | module-definition |
| [594](../../../../plugins/translation/src/sidebar.tsx#L594) | object-field | Stale | module-definition |
| [595](../../../../plugins/translation/src/sidebar.tsx#L595) | object-field | text-sky-700 | module-definition |
| [595](../../../../plugins/translation/src/sidebar.tsx#L595) | object-field | Suggested | module-definition |
| [596](../../../../plugins/translation/src/sidebar.tsx#L596) | object-field | text-zinc-500 | module-definition |
| [596](../../../../plugins/translation/src/sidebar.tsx#L596) | object-field | Skipped | module-definition |

### plugins/translation/src/config-modal.tsx

- [ ] Review [source](../../../../plugins/translation/src/config-modal.tsx) and classify its 25 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [159](../../../../plugins/translation/src/config-modal.tsx#L159) | object-field | Detected in manifest | terminology |
| [207](../../../../plugins/translation/src/config-modal.tsx#L207) | jsx-attribute | Run translations | mixed-jsx |
| [216](../../../../plugins/translation/src/config-modal.tsx#L216) | jsx-text | Cancel | — |
| [224](../../../../plugins/translation/src/config-modal.tsx#L224) | jsx-text | Run translation | — |
| [234](../../../../plugins/translation/src/config-modal.tsx#L234) | jsx-attribute | From | — |
| [237](../../../../plugins/translation/src/config-modal.tsx#L237) | jsx-attribute | No detected languages | — |
| [246](../../../../plugins/translation/src/config-modal.tsx#L246) | jsx-attribute | To | — |
| [256](../../../../plugins/translation/src/config-modal.tsx#L256) | jsx-text | Mode | — |
| [269](../../../../plugins/translation/src/config-modal.tsx#L269) | jsx-text | Auto | — |
| [270](../../../../plugins/translation/src/config-modal.tsx#L270) | jsx-text | WebGPU | — |
| [271](../../../../plugins/translation/src/config-modal.tsx#L271) | jsx-text | WASM | — |
| [296](../../../../plugins/translation/src/config-modal.tsx#L296) | jsx-text | Current resource | mixed-jsx |
| [307](../../../../plugins/translation/src/config-modal.tsx#L307) | jsx-text | No supported IIIF languages were detected in this manifest. | terminology |
| [313](../../../../plugins/translation/src/config-modal.tsx#L313) | jsx-text | Select different source and target languages. | — |
| [322](../../../../plugins/translation/src/config-modal.tsx#L322) | jsx-text | missing | mixed-jsx |
| [325](../../../../plugins/translation/src/config-modal.tsx#L325) | jsx-text | No missing strings | — |
| [330](../../../../plugins/translation/src/config-modal.tsx#L330) | jsx-text | total | mixed-jsx |
| [334](../../../../plugins/translation/src/config-modal.tsx#L334) | jsx-text | Missing target-language values will be filled using | mixed-jsx |
| [353](../../../../plugins/translation/src/config-modal.tsx#L353) | jsx-text | Filters | — |
| [365](../../../../plugins/translation/src/config-modal.tsx#L365) | jsx-text | Annotation bodies | mixed-jsx |
| [376](../../../../plugins/translation/src/config-modal.tsx#L376) | jsx-text | Canvas labels | mixed-jsx, terminology |
| [392](../../../../plugins/translation/src/config-modal.tsx#L392) | object-field | Detected in manifest | terminology |
| [395](../../../../plugins/translation/src/config-modal.tsx#L395) | object-field | {{expression1}} ({{expression2}}) | interpolation |
| [401](../../../../plugins/translation/src/config-modal.tsx#L401) | object-field | All languages | — |
| [417](../../../../plugins/translation/src/config-modal.tsx#L417) | object-field | No languages available | — |

### plugins/translation/src/plugin.ts

- [ ] Review [source](../../../../plugins/translation/src/plugin.ts) and classify its 15 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [7](../../../../plugins/translation/src/plugin.ts#L7) | object-field | Translations | module-definition |
| [8](../../../../plugins/translation/src/plugin.ts#L8) | object-field | Review manifest strings and fill missing translations with M2M100. | module-definition, terminology |
| [26](../../../../plugins/translation/src/plugin.ts#L26) | object-field | Default source language | module-definition |
| [28](../../../../plugins/translation/src/plugin.ts#L28) | object-field | Optional M2M100 source language code. Falls back to the editor default language. | module-definition |
| [29](../../../../plugins/translation/src/plugin.ts#L29) | object-field | en | module-definition |
| [33](../../../../plugins/translation/src/plugin.ts#L33) | object-field | Default target language | module-definition |
| [35](../../../../plugins/translation/src/plugin.ts#L35) | object-field | Optional M2M100 target language code. Falls back to another configured editor language. | module-definition |
| [36](../../../../plugins/translation/src/plugin.ts#L36) | object-field | nl | module-definition |
| [40](../../../../plugins/translation/src/plugin.ts#L40) | object-field | Runtime preference | module-definition |
| [42](../../../../plugins/translation/src/plugin.ts#L42) | object-field | WebGPU is attempted first in Auto mode, then WASM is used as a fallback. | module-definition |
| [44](../../../../plugins/translation/src/plugin.ts#L44) | object-field | Auto | module-definition |
| [45](../../../../plugins/translation/src/plugin.ts#L45) | object-field | WebGPU | module-definition |
| [46](../../../../plugins/translation/src/plugin.ts#L46) | object-field | WASM | module-definition |
| [51](../../../../plugins/translation/src/plugin.ts#L51) | object-field | Worker URL | module-definition |
| [53](../../../../plugins/translation/src/plugin.ts#L53) | object-field | Optional public URL for the translation worker when the package is consumed through another bundled package. | module-definition |

### plugins/translation/src/results.tsx

- [ ] Review [source](../../../../plugins/translation/src/results.tsx) and classify its 11 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [51](../../../../plugins/translation/src/results.tsx#L51) | jsx-attribute | Translation results | mixed-jsx |
| [54](../../../../plugins/translation/src/results.tsx#L54) | jsx-attribute | Strings | — |
| [55](../../../../plugins/translation/src/results.tsx#L55) | jsx-attribute | Translated | — |
| [56](../../../../plugins/translation/src/results.tsx#L56) | jsx-attribute | Applied | — |
| [57](../../../../plugins/translation/src/results.tsx#L57) | jsx-attribute | Existing | — |
| [58](../../../../plugins/translation/src/results.tsx#L58) | jsx-attribute | Stale | — |
| [59](../../../../plugins/translation/src/results.tsx#L59) | jsx-attribute | Skipped | — |
| [64](../../../../plugins/translation/src/results.tsx#L64) | jsx-text | Translated strings | — |
| [70](../../../../plugins/translation/src/results.tsx#L70) | jsx-text | occurrence | mixed-jsx |
| [70](../../../../plugins/translation/src/results.tsx#L70) | jsx-expression | s | mixed-jsx |
| [79](../../../../plugins/translation/src/results.tsx#L79) | jsx-text | Skipped strings | — |

### plugins/translation/src/background-action.test.ts

- [ ] Review [source](../../../../plugins/translation/src/background-action.test.ts) and classify its 7 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [25](../../../../plugins/translation/src/background-action.test.ts#L25) | object-field | Manifest | module-definition, terminology |
| [100](../../../../plugins/translation/src/background-action.test.ts#L100) | object-field | {{expression1}} [{{expression2}}] | interpolation |
| [182](../../../../plugins/translation/src/background-action.test.ts#L182) | object-field | Shared text | — |
| [194](../../../../plugins/translation/src/background-action.test.ts#L194) | object-field | Current canvas | terminology |
| [274](../../../../plugins/translation/src/background-action.test.ts#L274) | object-field | {{expression1}} [{{expression2}}] | interpolation |
| [320](../../../../plugins/translation/src/background-action.test.ts#L320) | object-field | Shared text [cy] | — |
| [393](../../../../plugins/translation/src/background-action.test.ts#L393) | message-call | Timed out waiting for predicate | user-or-developer-message-review |

### plugins/translation/src/runtime/__tests__/protocol.test.ts

- [ ] Review [source](../../../../plugins/translation/src/runtime/__tests__/protocol.test.ts) and classify its 6 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [23](../../../../plugins/translation/src/runtime/__tests__/protocol.test.ts#L23) | object-field | Hello | — |
| [33](../../../../plugins/translation/src/runtime/__tests__/protocol.test.ts#L33) | object-field | Hello | — |
| [57](../../../../plugins/translation/src/runtime/__tests__/protocol.test.ts#L57) | object-field | Привіт | — |
| [68](../../../../plugins/translation/src/runtime/__tests__/protocol.test.ts#L68) | object-field | Привіт | — |
| [79](../../../../plugins/translation/src/runtime/__tests__/protocol.test.ts#L79) | object-field | Model failed | — |
| [88](../../../../plugins/translation/src/runtime/__tests__/protocol.test.ts#L88) | object-field | Model failed | — |

### plugins/translation/src/background-action.tsx

- [ ] Review [source](../../../../plugins/translation/src/background-action.tsx) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [128](../../../../plugins/translation/src/background-action.tsx#L128) | object-field | Run translation | — |
| [129](../../../../plugins/translation/src/background-action.tsx#L129) | object-field | Translate missing manifest strings with M2M100 | terminology |
| [186](../../../../plugins/translation/src/background-action.tsx#L186) | object-field | No strings | — |
| [341](../../../../plugins/translation/src/background-action.tsx#L341) | object-field | Translations complete | — |
| [644](../../../../plugins/translation/src/background-action.tsx#L644) | message-call | Translation cancelled. | user-or-developer-message-review |

### plugins/translation/src/language-tags-background-action.ts

- [ ] Review [source](../../../../plugins/translation/src/language-tags-background-action.ts) and classify its 5 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [73](../../../../plugins/translation/src/language-tags-background-action.ts#L73) | object-field | Tag with languages | — |
| [74](../../../../plugins/translation/src/language-tags-background-action.ts#L74) | object-field | Tag each canvas with its detected language | terminology |
| [96](../../../../plugins/translation/src/language-tags-background-action.ts#L96) | object-field | No canvases | terminology |
| [190](../../../../plugins/translation/src/language-tags-background-action.ts#L190) | object-field | Language tagging complete | — |
| [489](../../../../plugins/translation/src/language-tags-background-action.ts#L489) | message-call | Language tagging cancelled. | user-or-developer-message-review |

### plugins/translation/src/language-tags-background-action.test.ts

- [ ] Review [source](../../../../plugins/translation/src/language-tags-background-action.test.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [23](../../../../plugins/translation/src/language-tags-background-action.test.ts#L23) | object-field | Manifest | module-definition, terminology |
| [65](../../../../plugins/translation/src/language-tags-background-action.test.ts#L65) | object-field | Canvas without a language map | terminology |
| [114](../../../../plugins/translation/src/language-tags-background-action.test.ts#L114) | object-field | en | — |
| [121](../../../../plugins/translation/src/language-tags-background-action.test.ts#L121) | object-field | cy | — |

### plugins/translation/src/runtime/browser/client.ts

- [ ] Review [source](../../../../plugins/translation/src/runtime/browser/client.ts) and classify its 4 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [82](../../../../plugins/translation/src/runtime/browser/client.ts#L82) | message-call | The translation worker crashed. | user-or-developer-message-review |
| [95](../../../../plugins/translation/src/runtime/browser/client.ts#L95) | message-call | The translation worker client has been terminated. | user-or-developer-message-review |
| [137](../../../../plugins/translation/src/runtime/browser/client.ts#L137) | message-call | The translation worker client has been terminated. | user-or-developer-message-review |
| [150](../../../../plugins/translation/src/runtime/browser/client.ts#L150) | message-call | Unable to start the translation worker. If you are using @manifest-editor/translation from a bundled package, provide a public workerUrl or pass a Worker instance. {{expression1}} | interpolation, terminology, user-or-developer-message-review |

### plugins/translation/src/runtime/__tests__/runtime.test.ts

- [ ] Review [source](../../../../plugins/translation/src/runtime/__tests__/runtime.test.ts) and classify its 3 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [22](../../../../plugins/translation/src/runtime/__tests__/runtime.test.ts#L22) | message-call | No WebGPU adapter | user-or-developer-message-review |
| [50](../../../../plugins/translation/src/runtime/__tests__/runtime.test.ts#L50) | object-field | No WebGPU adapter | — |
| [53](../../../../plugins/translation/src/runtime/__tests__/runtime.test.ts#L53) | object-field | Привіт | — |

### plugins/translation/src/runtime/worker/entry.ts

- [ ] Review [source](../../../../plugins/translation/src/runtime/worker/entry.ts) and classify its 1 candidates.

| Line | Kind | Candidate text | Complexity flags |
| ---: | --- | --- | --- |
| [54](../../../../plugins/translation/src/runtime/worker/entry.ts#L54) | object-field | The translation worker failed unexpectedly. | — |

## Formatting and content-language review points

| Source | Review kind | Code |
| --- | --- | --- |
| [plugins/translation/src/background-action.test.ts:79](../../../../plugins/translation/src/background-action.test.ts#L79) | content-language-config | defaultLanguage: "en" |
| [plugins/translation/src/background-action.test.ts:80](../../../../plugins/translation/src/background-action.test.ts#L80) | content-language-config | availableLanguages: ["en", "cy"] |
| [plugins/translation/src/background-action.test.ts:81](../../../../plugins/translation/src/background-action.test.ts#L81) | content-language-config | advancedLanguageMode: false |
| [plugins/translation/src/background-action.tsx:421](../../../../plugins/translation/src/background-action.tsx#L421) | content-language-config | availableLanguages: getSupportedAvailableLanguages(ctx.config) |

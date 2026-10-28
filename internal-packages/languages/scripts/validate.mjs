import { builtinNamespaces, prepareBuiltinResources } from "../src/catalogs.ts";
import { createCatalogContract, validateCatalog } from "../src/validation.ts";
import { createPseudoCatalog } from "../src/pseudo.ts";
import { flattenCatalog } from "../src/schema.ts";

let messages = 0;
for (const profile of ["standard", "plain"])
  for (const preset of ["manifest", "collection", "exhibition"]) {
    const snapshot = await prepareBuiltinResources({ namespaces: builtinNamespaces, profile, preset });
    for (const [namespace, catalog] of Object.entries(snapshot.resources["en-GB"])) {
      const issues = validateCatalog(catalog, snapshot.contracts[namespace], { locale: "en-GB" });
      const pseudo = createPseudoCatalog(catalog);
      issues.push(...validateCatalog(pseudo, createCatalogContract(catalog), { locale: "en-XA" }));
      if (issues.length) throw new Error(`${profile}/${preset}/${namespace}: ${JSON.stringify(issues)}`);
      if (profile === "standard" && preset === "manifest") messages += flattenCatalog(catalog).size;
    }
  }
console.log(
  `Validated ${messages} seed messages in ${builtinNamespaces.length} namespaces, six profile/preset combinations, and their pseudo-locales. This does not assert application coverage.`
);

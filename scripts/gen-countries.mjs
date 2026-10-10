// Ek dafa chalao: node scripts/gen-countries.mjs
// → src/data/countries.json (chhota, har jagah) + src/data/country-facts.json (Spotlight + country pages)
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const all = require("world-countries").filter((c) => c.cca2 && c.latlng?.length === 2 && c.independent !== false);
const byCca3 = new Map(all.map((c) => [c.cca3, c.cca2]));

const countries = all
  .map((c) => ({ code: c.cca2, name: c.name.common, flag: c.flag, lat: +c.latlng[0].toFixed(1), lng: +c.latlng[1].toFixed(1) }))
  .sort((a, b) => a.name.localeCompare(b.name));
writeFileSync("src/data/countries.json", JSON.stringify(countries));

const facts = {};
for (const c of all) {
  facts[c.cca2] = {
    official: c.name.official,
    capital: c.capital ?? [],
    region: c.region,
    subregion: c.subregion || null,
    languages: Object.values(c.languages ?? {}),
    currencies: Object.values(c.currencies ?? {}).map((x) => (x.symbol ? `${x.name} (${x.symbol})` : x.name)),
    area: c.area,
    demonym: c.demonyms?.eng?.m ?? null,
    landlocked: !!c.landlocked,
    borders: (c.borders ?? []).map((b) => byCca3.get(b)).filter(Boolean),
  };
}
writeFileSync("src/data/country-facts.json", JSON.stringify(facts));
console.log(countries.length, "countries,", Object.keys(facts).length, "fact sheets");

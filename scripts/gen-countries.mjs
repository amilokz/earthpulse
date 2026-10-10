// Ek dafa chalao: node scripts/gen-countries.mjs → src/data/countries.json
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";
const require = createRequire(import.meta.url);
const all = require("world-countries");
const out = all
  .filter((c) => c.cca2 && c.latlng?.length === 2 && c.independent !== false)
  .map((c) => ({ code: c.cca2, name: c.name.common, flag: c.flag, lat: +c.latlng[0].toFixed(1), lng: +c.latlng[1].toFixed(1) }))
  .sort((a, b) => a.name.localeCompare(b.name));
writeFileSync("src/data/countries.json", JSON.stringify(out));
console.log(out.length, "countries");

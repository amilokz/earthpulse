import facts from "@/data/country-facts.json";
import { COUNTRIES, getCountry, type Country } from "./countries";

export interface CountryFacts {
  official: string;
  capital: string[];
  region: string;
  subregion: string | null;
  languages: string[];
  currencies: string[];
  area: number;
  demonym: string | null;
  landlocked: boolean;
  borders: string[];
}

const FACTS = facts as Record<string, CountryFacts>;
export const getFacts = (code: string): CountryFacts | null => FACTS[code] ?? null;

/** Roz aik nayi country (sab ke liye same). 37 aur 195 ka koi common factor nahi, to har country baari baari aati hai. */
export function spotlightFor(day: string): Country & { facts: CountryFacts } {
  const n = Math.floor(Date.parse(day + "T00:00:00Z") / 864e5);
  const c = COUNTRIES[(n * 37) % COUNTRIES.length];
  return { ...getCountry(c.code), facts: FACTS[c.code] };
}

export const slug = (code: string) => code.toLowerCase();

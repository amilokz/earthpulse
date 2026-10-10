import data from "@/data/countries.json";

export interface Country {
  code: string;
  name: string;
  flag: string;
  lat: number;
  lng: number;
}

export const COUNTRIES = data as Country[];
const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

export const EARTH: Country = { code: "XX", name: "Earth", flag: "🌍", lat: 0, lng: 0 };

export const isCountry = (code: string) => BY_CODE.has(code);
export const getCountry = (code: string): Country => BY_CODE.get(code) ?? EARTH;

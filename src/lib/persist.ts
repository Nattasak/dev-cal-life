"use client";

import type { HappinessInputs } from "@/lib/happiness";

export type ThemePreference = "light" | "dark";

const STORAGE_KEY = "hInputs";
const THEME_KEY = "theme";

export const MINIMAL_KEYS: Array<keyof HappinessInputs> = [
  "age",
  "sleepHoursPerNight",
  "exerciseHoursPerWeek",
  "stressLevel",
];

export const ALL_KEYS: Array<keyof HappinessInputs> = [
  "age",
  "sleepHoursPerNight",
  "exerciseHoursPerWeek",
  "socialContactsPerWeek",
  "mindfulnessMinutesPerDay",
  "purposeScore",
  "incomeSatisfaction",
  "gratitudeDaysPerWeek",
  "screenTimeHoursPerDay",
  "natureHoursPerWeek",
  "workHoursPerWeek",
  "stressLevel",
  "pastSelfReport",
  "planAdherencePercent",
];

function parseNumber(n: unknown): number | undefined {
  if (n === null || n === undefined) return undefined;
  const parsed = typeof n === "number" ? n : parseFloat(String(n));
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function inputsFromQuery(
  search: string | URLSearchParams
): Partial<HappinessInputs> {
  const params =
    typeof search === "string" ? new URLSearchParams(search) : search;
  const result: Partial<HappinessInputs> = {};
  for (const key of ALL_KEYS) {
    const v = params.get(key);
    if (v !== null) {
      const n = parseNumber(v);
      if (n !== undefined) {
        (result as Partial<Record<keyof HappinessInputs, number>>)[key] = n;
      }
    }
  }
  return result;
}

export function inputsToQuery(
  inputs: HappinessInputs,
  keys: Array<keyof HappinessInputs> = MINIMAL_KEYS
): string {
  const params = new URLSearchParams();
  for (const key of keys) {
    const value = inputs[key];
    if (Number.isFinite(value)) params.set(key, String(value));
  }
  return params.toString();
}

export function saveInputsToStorage(inputs: HappinessInputs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  } catch {}
}

export function loadInputsFromStorage(): Partial<HappinessInputs> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<
      Record<keyof HappinessInputs, unknown>
    >;
    const result: Partial<HappinessInputs> = {};
    for (const key of ALL_KEYS) {
      const n = parseNumber(parsed?.[key]);
      if (n !== undefined) {
        (result as Partial<Record<keyof HappinessInputs, number>>)[key] = n;
      }
    }
    return result;
  } catch {
    return null;
  }
}

export function getStoredTheme(): ThemePreference | null {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === "light" || t === "dark") return t;
    return null;
  } catch {
    return null;
  }
}

export function setStoredTheme(theme: ThemePreference) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {}
}

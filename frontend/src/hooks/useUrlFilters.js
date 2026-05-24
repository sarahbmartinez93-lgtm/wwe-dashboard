import { useSearchParams } from "react-router-dom";

/**
 * Read/write filter state as URL search params.
 * Empty / null / undefined values are stripped from the URL so links stay clean.
 */
export function useUrlFilters(defaults = {}) {
  const [params, setParams] = useSearchParams();

  const value = { ...defaults };
  for (const k of Object.keys(defaults)) {
    const v = params.get(k);
    if (v !== null && v !== "") value[k] = v;
  }

  function setValue(next) {
    const merged = typeof next === "function" ? next(value) : { ...value, ...next };
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v === undefined || v === null || v === "") continue;
      if (defaults[k] !== undefined && String(v) === String(defaults[k])) continue;
      sp.set(k, String(v));
    }
    setParams(sp, { replace: true });
  }

  return [value, setValue];
}

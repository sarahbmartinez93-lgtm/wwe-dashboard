const BASE = "https://wwe-dashboard.onrender.com/api"

async function req(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    let body = null;
    try { body = await res.json(); } catch {}
    const err = new Error(body?.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.details = body?.details;
    err.kind = body?.error;
    throw err;
  }
  return res.json();
}

function post(path, payload) {
  return req(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

function qs(params = {}) {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (!entries.length) return "";
  return "?" + new URLSearchParams(entries).toString();
}

export const api = {
  brands: () => req("/brands"),
  wrestlers: (params) => req(`/wrestlers${qs(params)}`),
  wrestler: (id) => req(`/wrestlers/${id}`),
  championships: (params) => req(`/championships${qs(params)}`),
  events: (params) => req(`/events${qs(params)}`),
  matches: (params) => req(`/matches${qs(params)}`),
  currentChampions: (params) => req(`/stats/current-champions${qs(params)}`),
  rankings: (params) => req(`/stats/rankings${qs(params)}`),
  topWrestlers: (params) => req(`/stats/top-wrestlers${qs(params)}`),
  compare: (a, b) => req(`/stats/compare${qs({ a, b })}`),
  createWrestler: (payload) => post("/wrestlers", payload),
  createEvent: (payload) => post("/events", payload),
  createMatch: (payload) => post("/matches", payload),
  createTitleChange: (payload) => post("/title-changes", payload),
};

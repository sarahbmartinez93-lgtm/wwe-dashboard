import { useEffect, useState } from "react";
import { api } from "../api/client.js";

export default function FilterBar({ value, onChange, show = {} }) {
  const [brands, setBrands] = useState([]);
  const [championships, setChampionships] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => { api.brands().then(setBrands).catch(() => {}); }, []);
  useEffect(() => {
    if (show.championship) api.championships().then(setChampionships).catch(() => {});
  }, [show.championship]);
  useEffect(() => {
    if (show.event) api.events().then(setEvents).catch(() => {});
  }, [show.event]);

  const set = (k, v) => onChange({ ...value, [k]: v || undefined });
  const hasAny = Object.values(value).some((v) => v !== undefined && v !== null && v !== "" && v !== "all");

  return (
    <div className="filter-bar">
      {show.brand !== false && (
        <div className="filter-group">
          <label>Brand</label>
          <select value={value.brand ?? ""} onChange={(e) => set("brand", e.target.value)}>
            <option value="">All brands</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
      )}
      {show.titleStatus && (
        <div className="filter-group">
          <label>Title status</label>
          <select value={value.status ?? "all"} onChange={(e) => set("status", e.target.value)}>
            <option value="all">All titles</option>
            <option value="active">Active only</option>
            <option value="vacant">Vacant only</option>
          </select>
        </div>
      )}
      {show.wrestlerStatus && (
        <div className="filter-group">
          <label>Wrestler status</label>
          <select value={value.status ?? ""} onChange={(e) => set("status", e.target.value)}>
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      )}
      {show.matchType && (
        <div className="filter-group">
          <label>Match type</label>
          <select value={value.match_type ?? ""} onChange={(e) => set("match_type", e.target.value)}>
            <option value="">Any type</option>
            <option value="singles">Singles</option>
            <option value="tag">Tag</option>
            <option value="triple-threat">Triple Threat</option>
            <option value="fatal-four-way">Fatal 4-Way</option>
            <option value="royal-rumble">Royal Rumble</option>
          </select>
        </div>
      )}
      {show.championship && (
        <div className="filter-group">
          <label>Championship</label>
          <select value={value.championship ?? ""} onChange={(e) => set("championship", e.target.value)}>
            <option value="">Any title</option>
            {championships.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}
      {show.event && (
        <div className="filter-group">
          <label>Event</label>
          <select value={value.event ?? ""} onChange={(e) => set("event", e.target.value)}>
            <option value="">Any event</option>
            {events.map((ev) => <option key={ev.id} value={ev.id}>{ev.name}</option>)}
          </select>
        </div>
      )}
      {hasAny && (
        <div className="filter-group" style={{ justifyContent: "flex-end" }}>
          <label>&nbsp;</label>
          <button
            type="button"
            className="btn secondary"
            style={{ padding: "8px 12px" }}
            onClick={() => onChange({})}
          >Clear</button>
        </div>
      )}
    </div>
  );
}
